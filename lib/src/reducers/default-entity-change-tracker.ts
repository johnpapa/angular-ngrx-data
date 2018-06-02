import { EntityAdapter, EntityState } from '@ngrx/entity';

import { EntityChangeTracker } from './entity-change-tracker';
import { Dictionary, IdSelector, Update } from '../utils/ngrx-entity-models';
import { defaultSelectId } from '../utils/utilities';
import { ChangeState, ChangeStateMap, ChangeType, EntityCollection } from './entity-collection';

/**
 * Subset of th @ngrx/entity EntityAdapter methods needed by DefaultEntityChangeTracker
 * to update the collection during undo
 */
export interface MiniEntityAdapter<T> {
  removeMany<S extends EntityState<T>>(keys: string[], state: S): S;
  upsertMany<S extends EntityState<T>>(entities: T[], state: S): S;
}

/**
 * The default implementation of EntityChangeTracker with
 * methods for tracking, committing, and reverting/undoing unsaved entity changes.
 * Used by EntityCollectionReducerMethods which should call tracker methods BEFORE modifying the collection.
 * See EntityChangeTracker docs.
 */
export class DefaultEntityChangeTracker<T> implements EntityChangeTracker<T> {
  constructor(private adapter: MiniEntityAdapter<T>, private selectId?: IdSelector<T>) {
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
   * Commit changes for the given entity as when it has been refreshed from the server.
   * Harmless when there is no entity to commit.
   * @param entityOrId The entity to clear tracking or its id.
   * @param collection The entity collection
   */
  commitOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T> {
    return this.commitMany([entityOrId], collection);
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

  // #region track methods

  /**
   * Track an entity add.
   * Call before adding the entity.
   * @param entity The entity to add. The entity must have its id.
   * @param collection The entity collection
   */
  trackAddOne(entity: T, collection: EntityCollection<T>): EntityCollection<T> {
    return this.trackAddMany([entity], collection);
  }

  /**
   * Track multiple entity updates of the same change type
   * @param entities The entities to add. They must all have their ids.
   * @param collection The entity collection
   */
  trackAddMany(entities: T[], collection: EntityCollection<T>): EntityCollection<T> {
    return this.trackMany(entities, collection, ChangeType.Added);
  }

  /**
   * Track an entity removal with the intention of deleting it on the server.
   * Call before removing the entity.
   * @param entityOrId The entity or its id.
   * @param collection The entity collection
   */
  trackDeleteOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T> {
    return this.trackDeleteMany([entityOrId], collection);
  }

  /**
   * Track multiple removed entities with the intention of deleting them on the server.
   * Call before removing the entities
   * @param entityOrId The entities or their ids.
   * @param collection The entity collection
   */
  trackDeleteMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T> {
    return this.trackMany(entityOrIdList, collection, ChangeType.Deleted);
  }

  /**
   * Track an entity change for the given entity.
   * Call before the update.
   * @param entityOrId The entity or its id.
   * @param collection The entity collection
   */
  trackUpdateOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T> {
    return this.trackUpdateMany([entityOrId], collection);
  }

  /**
   * Track multiple entity updates of the same change type.
   * Call before the updates.
   * @param entityOrId The entities or their ids.
   * @param collection The entity collection
   */
  trackUpdateMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T> {
    return this.trackMany(entityOrIdList, collection, ChangeType.Updated);
  }

  /**
   * Track an entity upsert (either an add or an update).
   * Call before the upsert.
   * @param entity The entity to add or update. It must be complete, including its id.
   * @param collection The entity collection
   */
  trackUpsertOne(entity: T, collection: EntityCollection<T>): EntityCollection<T> {
    return this.trackUpsertMany([entity], collection);
  }

  /**
   * Track multiple entity upserts (adds and updates).
   * Call before the upserts.
   * @param entityOrId The entities to add or update. They must be complete entities with ids.
   * @param collection The entity collection
   */
  trackUpsertMany(entities: T[], collection: EntityCollection<T>): EntityCollection<T> {
    // split upsert entities into adds and updates
    const entityMap = collection.entities;
    const { adds, updates } = entities.reduce(
      (acc, entity) => {
        if (entityMap[this.selectId(entity)]) {
          acc.updates.push(entity);
        } else {
          acc.adds.push(entity);
        }
        return acc;
      },
      { adds: [] as T[], updates: [] as T[] }
    );

    // track adds and updates in the collection's ChangeState map.
    collection = this.trackMany(adds, collection, ChangeType.Added);
    return this.trackMany(updates, collection, ChangeType.Updated);
  }
  // #endregion track methods

  // #region core track methods
  // All track... methods delegate to these two
  /**
   * Track an entity change for the given entity.
   * Call before making the change.
   * @param entityOrId The entity or its id.
   * @param collection The entity collection
   * @param changeType What the reducer will do to the collection with this entity
   * For ChangeType.added, it must be the entity with an entity id.
   */
  trackOne(entityOrId: number | string | T, collection: EntityCollection<T>, changeType: ChangeType): EntityCollection<T> {
    return this.trackMany([entityOrId], collection, changeType);
  }

  /**
   * Track multiple entity changes of the same change type.
   * Call before making the change.
   * @param entityOrId The entities or their ids.
   * @param collection The entity collection
   * @param changeType What the reducer will do to the collection with these entities
   * For ChangeType.added, they must be entities with entity ids.
   */
  trackMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>, changeType: ChangeType): EntityCollection<T> {
    if (entityOrIdList == null || entityOrIdList.length === 0) {
      return collection; // nothing to track
    }
    const oldChangeState = collection.changeState;

    const changeState = entityOrIdList.reduce((map, entityOrId) => {
      const entity = typeof entityOrId === 'object' ? entityOrId : collection.entities[entityOrId];
      const id = entity && this.selectId(entity);
      // Track changes for entity with an entity id.
      return entity && id ? this.updateChangeStateMap(map, changeType, entity, id) : map;
    }, collection.changeState);

    return changeState === oldChangeState ? collection : { ...collection, changeState };
  }

  /**
   * Return the ChangeStateMap, as an updated clone if need to update it
   * @param map current version of the ChangeStateMap
   * @param changeType of the operation to be performed
   * @param entity the entity being changed
   * @param id that entity's id
   */
  private updateChangeStateMap(map: ChangeStateMap<T>, changeType: ChangeType, entity: T, id: number | string): ChangeStateMap<T> {
    const trackedChange = map[id];

    // Already in ChangeStateMap.
    if (trackedChange) {
      // Do nothing to existing tracked change except in the delete case
      if (changeType === ChangeType.Deleted) {
        // Stop tracking if removing an added entity
        // NB: this method does not remove the entity from the collection!
        //     A reducer method should remove it from the collection immediately
        //     and not try to delete it from the server
        // TODO: consider removing these entities here.
        if (trackedChange.changeType === ChangeType.Added) {
          map = { ...map };
          delete map[id];

          // Turn a pending Update change into a Delete change.
          // because the reducer is about to remove it from the collection.
        } else if (trackedChange.changeType === ChangeType.Updated) {
          map = {
            ...map,
            [id]: {
              changeType: ChangeType.Deleted,
              originalValue: trackedChange.originalValue
            }
          };
        }
      }

      // Not in ChangeStateMap so add it.
    } else {
      map = {
        ...map,
        [id]: {
          changeType,
          // record original values only for Updated and Deleted change types.
          originalValue: changeType === ChangeType.Deleted || changeType === ChangeType.Updated ? entity : undefined
        } as ChangeState<T>
      };
    }
    return map;
  }
  // #endregion core track methods

  // #region undo methods
  /**
   * Revert the unsaved change for the given entity.
   * Harmless when there is no entity to undo.
   * @param entityOrId The entity to revert or its id.
   * @param collection The entity collection.
   */
  undoOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T> {
    return this.undoMany([entityOrId], collection);
  }

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
    let shouldMutate = false;

    const { map: changeState, remove, upsert } = entityOrIdList.reduce(
      (acc, entityOrId) => {
        const { map } = acc;
        const id = typeof entityOrId === 'object' ? (this.selectId(entityOrId) as string) : (entityOrId as string);
        if (map[id]) {
          shouldMutate = true;
          const change = map[id];
          delete map[id]; // clear tracking of this entity

          switch (change.changeType) {
            case ChangeType.Added:
              acc.remove.push(id);
              break;
            case ChangeType.Deleted:
              acc.upsert.push(change.originalValue);
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
        remove: [] as string[],
        upsert: [] as T[],
        map: { ...collection.changeState }
      }
    );

    collection = this.adapter.removeMany(remove, collection);
    collection = this.adapter.upsertMany(upsert, collection);

    return shouldMutate ? collection : { ...collection, changeState };
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
        const changeState = acc.map[id];
        switch (changeState.changeType) {
          case ChangeType.Added:
            acc.remove.push(id);
            break;
          case ChangeType.Deleted:
            acc.upsert.push(changeState.originalValue);
            break;
          case ChangeType.Updated:
            acc.upsert.push(changeState.originalValue);
            break;
        }
        return acc;
      },
      // entitiesToUndo
      {
        remove: [] as string[],
        upsert: [] as T[],
        map: collection.changeState
      }
    );

    collection = this.adapter.removeMany(remove, collection);
    collection = this.adapter.upsertMany(upsert, collection);

    return { ...collection, changeState: {} };
  }
  // #endregion undo methods
}
