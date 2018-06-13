import { EntityAdapter, EntityState } from '@ngrx/entity';

import { ChangeState, ChangeStateMap, ChangeType, EntityCollection } from './entity-collection';
import { defaultSelectId } from '../utils/utilities';
import { Dictionary, IdSelector, Update, UpdateData } from '../utils/ngrx-entity-models';
import { EntityAction, EntityActionOptions } from '../actions/entity-action';
import { EntityChangeTracker } from './entity-change-tracker';
import { MergeStrategy } from '../actions/merge-strategy';

/**
 * The default implementation of EntityChangeTracker with
 * methods for tracking, committing, and reverting/undoing unsaved entity changes.
 * Used by EntityCollectionReducerMethods which should call tracker methods BEFORE modifying the collection.
 * See EntityChangeTracker docs.
 */
export class DefaultEntityChangeTracker<T> implements EntityChangeTracker<T> {
  constructor(private adapter: EntityAdapter<T>, private selectId?: IdSelector<T>) {
    /** Extract the primary key (id); default to `id` */
    this.selectId = selectId || defaultSelectId;
  }

  // #region commit methods
  /**
   * Commit all changes as when the collection has been completely reloaded from the server.
   * Harmless when there are no entities to commit.
   * @param collection The entity collection
   */
  commitAll(collection: EntityCollection<T>): EntityCollection<T> {
    return Object.keys(collection.changeState).length === 0 ? collection : { ...collection, changeState: {} };
  }

  /**
   * Commit changes for the given entities as when they have been refreshed from the server.
   * Harmless when there are no entities to commit.
   * @param entityOrId The entities to clear tracking or their ids.
   * @param collection The entity collection
   */
  commitMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T> {
    if (entityOrIdList == null || entityOrIdList.length === 0) {
      return collection; // nothing to commit
    }
    const oldChangeState = collection.changeState;

    const changeState = entityOrIdList.reduce((map, entityOrId) => {
      const id = typeof entityOrId === 'object' ? this.selectId(entityOrId) : entityOrId;
      if (map[id]) {
        map = { ...map };
        delete map[id];
      }
      return map;
    }, collection.changeState);

    return changeState === oldChangeState ? collection : { ...collection, changeState };
  }
  // #endregion commit methods

  // #region merge query

  /**
   * Merge query results into the collection, adjusting the ChangeState per the mergeStrategy.
   * The default is MergeStrategy.PreserveChanges.
   * @param mergeStrategy How to merge a queried entity when the corresponding entity in the collection has an unsaved change.
   * @param entities Entities returned from querying the server.
   * @param collection The entity collection
   * @returns The merged EntityCollection.
   */
  mergeQueryResults(mergeStrategy: MergeStrategy, entities: T[], collection: EntityCollection<T>): EntityCollection<T> {
    return this.mergeServerUpserts(MergeStrategy.PreserveChanges, mergeStrategy, entities, collection);
  }
  // #endregion merge query results

  // #region merge save results

  /**
   * Merge result of saving new entities into the collection, adjusting the ChangeState per the mergeStrategy.
   * The default is MergeStrategy.OverwriteChanges.
   * @param mergeStrategy How to merge a saved entity when the corresponding entity in the collection has an unsaved change.
   * @param entities Entities returned from saving new entities to the server.
   * @param collection The entity collection
   * @returns The merged EntityCollection.
   */
  mergeSaveAdds(mergeStrategy: MergeStrategy, entities: T[], collection: EntityCollection<T>): EntityCollection<T> {
    return this.mergeServerUpserts(MergeStrategy.OverwriteChanges, mergeStrategy, entities, collection);
  }

  /**
   * Merge successful result of deleting entities on the server that have the given primary keys
   * Clears the entity changeState for those keys unless the MergeStrategy is ignoreChanges.
   * @param mergeStrategy How to adjust change tracking when the corresponding entity in the collection has an unsaved change.
   * @param entities keys primary keys of the entities to remove/delete.
   * @param collection The entity collection
   * @returns The merged EntityCollection.
   */
  mergeSaveDeletes(mergeStrategy: MergeStrategy, keys: (number | string)[], collection: EntityCollection<T>): EntityCollection<T> {
    mergeStrategy = mergeStrategy == null ? MergeStrategy.OverwriteChanges : mergeStrategy;
    // same logic for all non-ignore merge strategies: always clear (commit) the changes
    const deleteIds = keys as string[]; // make TypeScript happy
    collection = mergeStrategy === MergeStrategy.IgnoreChanges ? collection : this.commitMany(deleteIds, collection);
    return this.adapter.removeMany(deleteIds, collection);
  }

  /**
   * Merge result of saving upserted entities into the collection, adjusting the ChangeState per the mergeStrategy.
   * The default is MergeStrategy.OverwriteChanges.
   * @param mergeStrategy How to merge a saved entity when the corresponding entity in the collection has an unsaved change.
   * @param entities Entities returned from saving upserts to the server.
   * @param collection The entity collection
   * @returns The merged EntityCollection.
   */
  mergeSaveUpserts(mergeStrategy: MergeStrategy, entities: T[], collection: EntityCollection<T>): EntityCollection<T> {
    return this.mergeServerUpserts(MergeStrategy.OverwriteChanges, mergeStrategy, entities, collection);
  }

  /**
   * Merge result of saving updated entities into the collection, adjusting the ChangeState per the mergeStrategy.
   * The default is MergeStrategy.OverwriteChanges.
   * @param mergeStrategy How to merge a saved entity when the corresponding entity in the collection has an unsaved change.
   * @param skipUnchanged True if should skip update when unchanged (for optimistic updates)
   * @param entities Entities returned from saving updated entities to the server.
   * @param collection The entity collection
   * @returns The merged EntityCollection.
   */
  mergeSaveUpdates(
    mergeStrategy: MergeStrategy,
    skipUnchanged: boolean,
    updates: UpdateData<T>[],
    collection: EntityCollection<T>
  ): EntityCollection<T> {
    if (updates == null || updates.length === 0) {
      return collection; // nothing to merge.
    }

    let didMutate = false;
    let changeState = collection.changeState;
    mergeStrategy = mergeStrategy == null ? MergeStrategy.OverwriteChanges : mergeStrategy;

    switch (mergeStrategy) {
      case MergeStrategy.IgnoreChanges:
        updates = purgeUnchanged(updates);
        return this.adapter.updateMany(updates, collection);

      case MergeStrategy.OverwriteChanges:
        changeState = updates.reduce((chgState, update) => {
          const oldId = update.id;
          const change = chgState[oldId];
          if (change) {
            if (!didMutate) {
              chgState = { ...chgState };
              didMutate = true;
            }
            delete chgState[oldId];
          }
          return chgState;
        }, collection.changeState);

        collection = didMutate ? { ...collection, changeState } : collection;

        updates = purgeUnchanged(updates);
        return this.adapter.updateMany(updates, collection);

      case MergeStrategy.PreserveChanges: {
        let updateEntities = [] as UpdateData<T>[];
        changeState = updates.reduce((chgState, update) => {
          const oldId = update.id;
          const change = chgState[oldId];
          if (change) {
            // Tracking a change so update original value but not the current value
            if (!didMutate) {
              chgState = { ...chgState };
              didMutate = true;
            }
            const newId = this.selectId(update.changes);
            const oldChangeState = chgState[oldId];
            // If the server changed the id, register the new "originalValue" under the new id
            // and remove the change tracked under the old id.
            if (newId !== oldId) {
              delete chgState[oldId];
            }
            const newOrigValue = { ...(oldChangeState.originalValue as any), ...(update.changes as any) };
            chgState[newId] = { ...oldChangeState, originalValue: newOrigValue };
          } else {
            updateEntities.push(update);
          }
          return chgState;
        }, collection.changeState);
        collection = didMutate ? { ...collection, changeState } : collection;

        updateEntities = purgeUnchanged(updateEntities);
        return this.adapter.updateMany(updateEntities, collection);
      }
    }

    /** Exclude the unchanged updates for optimistic saves and strip off the `unchanged` property */
    function purgeUnchanged(ups: UpdateData<T>[]): UpdateData<T>[] {
      if (skipUnchanged) {
        ups = ups.filter(u => !u.unchanged);
      }
      return ups.map(up => {
        const { unchanged, ...update } = up;
        return update;
      });
    }
  }

  // #endregion merge save results

  // #region query & save helpers

  /**
   *
   * @param defaultMergeStrategy How to merge when action's MergeStrategy is unspecified
   * @param mergeStrategy The actions's MergeStrategy
   * @param entities Entities to merge
   * @param collection Collection into which entities are merged
   */
  private mergeServerUpserts(
    defaultMergeStrategy: MergeStrategy,
    mergeStrategy: MergeStrategy,
    entities: T[],
    collection: EntityCollection<T>
  ): EntityCollection<T> {
    if (entities == null || entities.length === 0) {
      return collection; // nothing to merge.
    }

    let didMutate = false;
    let changeState = collection.changeState;
    mergeStrategy = mergeStrategy == null ? defaultMergeStrategy : mergeStrategy;

    switch (mergeStrategy) {
      case MergeStrategy.IgnoreChanges:
        return this.adapter.upsertMany(entities, collection);

      case MergeStrategy.OverwriteChanges:
        collection = this.adapter.upsertMany(entities, collection);

        changeState = entities.reduce((chgState, entity) => {
          const id = this.selectId(entity);
          const change = chgState[id];
          if (change) {
            if (!didMutate) {
              chgState = { ...chgState };
              didMutate = true;
            }
            delete chgState[id];
          }
          return chgState;
        }, collection.changeState);

        return didMutate ? { ...collection, changeState } : collection;

      case MergeStrategy.PreserveChanges: {
        const upsertEntities = [] as T[];
        changeState = entities.reduce((chgState, entity) => {
          const id = this.selectId(entity);
          const change = chgState[id];
          if (change) {
            if (!didMutate) {
              chgState = { ...chgState };
              didMutate = true;
            }
            chgState[id].originalValue = entity;
          } else {
            upsertEntities.push(entity);
          }
          return chgState;
        }, collection.changeState);

        collection = this.adapter.upsertMany(upsertEntities, collection);
        return didMutate ? { ...collection, changeState } : collection;
      }
    }
  }
  // #endregion query & save helpers

  // #region track methods

  /**
   * Track multiple entity updates of the same change type.
   * Does NOT add to the collection (the reducer's job).
   * @param mergeStrategy Don't track if is MergeStrategy.IgnoreChanges
   * @param entities The entities to add. They must all have their ids.
   * @param collection The entity collection
   */
  trackAddMany(mergeStrategy: MergeStrategy, entities: T[], collection: EntityCollection<T>): EntityCollection<T> {
    if (mergeStrategy === MergeStrategy.IgnoreChanges || entities == null || entities.length === 0) {
      return collection; // nothing to track
    }
    let didMutate = false;
    const changeState = entities.reduce((chgState, entity) => {
      const id = this.selectId(entity);
      if (id == null || id === '') {
        throw new Error(`${collection.entityName} requires a key to be tracked`);
      }
      const trackedChange = changeState[id];

      if (!trackedChange) {
        if (!didMutate) {
          didMutate = true;
          chgState = { ...chgState };
        }
        chgState[id] = { changeType: ChangeType.Added };
      }
      return chgState;
    }, collection.changeState);
    return didMutate ? { ...collection, changeState } : collection;
  }

  /**
   * Track multiple removed entities with the intention of deleting them on the server.
   * Does NOT remove from the collection (the reducer's job).
   * Call before removing the entities.
   * @param mergeStrategy Don't track if is MergeStrategy.IgnoreChanges
   * @param keys The primary keys of the entities to delete.
   * @param collection The entity collection
   */
  trackDeleteMany(mergeStrategy: MergeStrategy, keys: (number | string)[], collection: EntityCollection<T>): EntityCollection<T> {
    if (mergeStrategy === MergeStrategy.IgnoreChanges || keys == null || keys.length === 0) {
      return collection; // nothing to track
    }
    let didMutate = false;
    const changeState = keys.reduce((chgState, id) => {
      const trackedChange = changeState[id];

      if (trackedChange) {
        if (trackedChange.changeType === ChangeType.Added) {
          // Special case: stop tracking an added entity that you delete
          // The caller should also detect this, remove it immediately from the collection
          // and skip attempt to delete on the server.
          cloneChgStateOnce();
          delete chgState[id];
        } else if (trackedChange.changeType === ChangeType.Updated) {
          // Special case: switch change type from Updated to Deleted.
          cloneChgStateOnce();
          chgState[id].changeType = ChangeType.Deleted;
        }
      } else {
        // Start tracking this entity
        cloneChgStateOnce();
        chgState[id] = { changeType: ChangeType.Deleted, originalValue: collection.entities[id] };
      }
      return chgState;

      function cloneChgStateOnce() {
        if (!didMutate) {
          didMutate = true;
          chgState = { ...chgState };
        }
      }
    }, collection.changeState);

    return didMutate ? { ...collection, changeState } : collection;
  }

  /**
   * Track multiple entity updates of the same change type.
   * Does NOT update the collection (the reducer's job).
   * Call before the updates.
   * @param mergeStrategy Don't track if is MergeStrategy.IgnoreChanges
   * @param updates The entities to update.
   * @param collection The entity collection
   */
  trackUpdateMany(mergeStrategy: MergeStrategy, updates: Update<T>[], collection: EntityCollection<T>): EntityCollection<T> {
    if (mergeStrategy === MergeStrategy.IgnoreChanges || updates == null || updates.length === 0) {
      return collection; // nothing to track
    }
    let didMutate = false;
    const changeState = updates.reduce((chgState, update) => {
      const { id, changes: entity } = update;
      if (id == null || id === '') {
        throw new Error(`${collection.entityName} requires a key to be tracked`);
      }
      const trackedChange = changeState[id];

      if (!trackedChange) {
        if (!didMutate) {
          didMutate = true;
          chgState = { ...chgState };
        }
        chgState[id] = { changeType: ChangeType.Updated };
      }
      return chgState;
    }, collection.changeState);
    return didMutate ? { ...collection, changeState } : collection;
  }

  /**
   * Track multiple entity upserts (adds and updates).
   * Does NOT update the collection (the reducer's job).
   * Call before the upserts.
   * @param mergeStrategy Don't track if is MergeStrategy.IgnoreChanges
   * @param entities The entities to add or update. They must be complete entities with ids.
   * @param collection The entity collection
   */
  trackUpsertMany(mergeStrategy: MergeStrategy, entities: T[], collection: EntityCollection<T>): EntityCollection<T> {
    if (mergeStrategy === MergeStrategy.IgnoreChanges || entities == null || entities.length === 0) {
      return collection; // nothing to track
    }
    let didMutate = false;
    const entityMap = collection.entities;
    const changeState = entities.reduce((chgState, entity) => {
      const id = this.selectId(entity);
      if (id == null || id === '') {
        throw new Error(`${collection.entityName} requires a key to be tracked`);
      }
      const trackedChange = changeState[id];

      if (!trackedChange) {
        if (!didMutate) {
          didMutate = true;
          chgState = { ...chgState };
        }

        const origEntity = entityMap[id];
        chgState[id] =
          origEntity == null ? { changeType: ChangeType.Added } : { changeType: ChangeType.Updated, originalValue: origEntity };
      }
      return chgState;
    }, collection.changeState);
    return didMutate ? { ...collection, changeState } : collection;
  }
  // #endregion track methods

  // #region undo methods

  /**
   * Revert the unsaved changes for the given entities.
   * Harmless when there are not entities to undo.
   * @param entityOrId The entities to revert or their ids.
   * @param collection The entity collection
   */
  undoMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T> {
    if (entityOrIdList == null || entityOrIdList.length === 0) {
      return collection; // nothing to undo
    }
    let didMutate = false;

    const { chgState: changeState, remove, upsert } = entityOrIdList.reduce(
      (acc, entityOrId) => {
        const { chgState } = acc;
        const id = typeof entityOrId === 'object' ? this.selectId(entityOrId) : entityOrId;
        if (chgState[id]) {
          didMutate = true;
          const change = chgState[id];
          delete chgState[id]; // clear tracking of this entity

          switch (change.changeType) {
            case ChangeType.Added:
              acc.remove.push(id);
              break;
            case ChangeType.Deleted:
              const removed = change.originalValue;
              if (removed) {
                acc.upsert.push(removed);
              }
              break;
            case ChangeType.Updated:
              acc.upsert.push(change.originalValue);
              break;
          }
        }
        return acc;
      },
      // entitiesToUndo
      {
        remove: [] as (number | string)[],
        upsert: [] as T[],
        chgState: { ...collection.changeState }
      }
    );

    collection = this.adapter.removeMany(remove as string[], collection);
    collection = this.adapter.upsertMany(upsert, collection);

    return didMutate ? collection : { ...collection, changeState };
  }

  /**
   * Revert the unsaved changes for all collection.
   * Harmless when there are not entities to undo.
   * @param collection The entity collection
   */
  undoAll(collection: EntityCollection<T>): EntityCollection<T> {
    const ids = Object.keys(collection.changeState);

    const { remove, upsert } = ids.reduce(
      (acc, id) => {
        const changeState = acc.chgState[id];
        switch (changeState.changeType) {
          case ChangeType.Added:
            acc.remove.push(id);
            break;
          case ChangeType.Deleted:
            const removed = changeState.originalValue;
            if (removed) {
              acc.upsert.push(removed);
            }
            break;
          case ChangeType.Updated:
            acc.upsert.push(changeState.originalValue);
            break;
        }
        return acc;
      },
      // entitiesToUndo
      {
        remove: [] as (number | string)[],
        upsert: [] as T[],
        chgState: collection.changeState
      }
    );

    collection = this.adapter.removeMany(remove as string[], collection);
    collection = this.adapter.upsertMany(upsert, collection);

    return { ...collection, changeState: {} };
  }
  // #endregion undo methods
}
