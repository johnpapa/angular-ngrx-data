import { ChangeState, ChangeStateMap, ChangeType, EntityCollection } from './entity-collection';
import { MergeStrategy } from '../actions/merge-strategy';
import { Update } from '../utils/ngrx-entity-models';

/**
 * Methods for tracking, committing, and reverting/undoing unsaved entity changes.
 * Used by EntityCollectionReducerMethods which should call tracker methods BEFORE modifying the collection.
 * See EntityChangeTracker docs.
 */
export interface EntityChangeTracker<T> {
  /**
   * Commit all changes as when the collection has been completely reloaded from the server.
   * Harmless when there are no entities to commit.
   * @param collection The entity collection
   */
  commitAll(collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Commit changes for the given entities as when they have been refreshed from the server.
   * Harmless when there are no entities to commit.
   * @param entityOrId The entities to clear tracking or their ids.
   * @param collection The entity collection
   */
  commitMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Merge query results into the collection, adjusting the ChangeState per the mergeStrategy.
   * The default is MergeStrategy.PreserveChanges.
   * @param mergeStrategy How to merge a queried entity when the corresponding entity in the collection has an unsaved change.
   * @param entities Entities returned from querying the server.
   * @param collection The entity collection
   * @returns The merged EntityCollection.
   */
  mergeQueryResults(mergeStrategy: MergeStrategy, entities: T[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Merge result of saving new entities into the collection, adjusting the ChangeState per the mergeStrategy.
   * The default is MergeStrategy.OverwriteChanges.
   * @param mergeStrategy How to merge a saved entity when the corresponding entity in the collection has an unsaved change.
   * @param entities Entities returned from saving new entities to the server.
   * @param collection The entity collection
   * @returns The merged EntityCollection.
   */
  mergeSaveAdds(mergeStrategy: MergeStrategy, entities: T[], collection: EntityCollection<T>): EntityCollection<T>;
  /**
   * Merge successful result of deleting entities on the server that have the given primary keys
   * Clears the entity changeState for those keys unless the MergeStrategy is ignoreChanges.
   * @param mergeStrategy How to adjust change tracking when the corresponding entity in the collection has an unsaved change.
   * @param entities keys primary keys of the entities to remove/delete.
   * @param collection The entity collection
   * @returns The merged EntityCollection.
   */
  mergeSaveDeletes(mergeStrategy: MergeStrategy, keys: (number | string)[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Merge result of saving upserted entities into the collection, adjusting the ChangeState per the mergeStrategy.
   * The default is MergeStrategy.OverwriteChanges.
   * @param mergeStrategy How to merge a saved entity when the corresponding entity in the collection has an unsaved change.
   * @param entities Entities returned from saving upsert entities to the server.
   * @param collection The entity collection
   * @returns The merged EntityCollection.
   */
  mergeSaveUpserts(mergeStrategy: MergeStrategy, entities: T[], collection: EntityCollection<T>): EntityCollection<T>;

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
    updates: Update<T>[],
    collection: EntityCollection<T>
  ): EntityCollection<T>;

  /**
   * Track multiple entity updates of the same change type
   * Does NOT add to the collection (the reducer's job).
   * @param mergeStrategy Don't track if is MergeStrategy.IgnoreChanges
   * @param entities The entities to add. They must all have their ids.
   * @param collection The entity collection
   */
  trackAddMany(mergeStrategy: MergeStrategy, entities: T[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Track multiple removed entities with the intention of deleting them on the server.
   * Does NOT remove from the collection (the reducer's job).
   * Call before removing the entities
   * @param mergeStrategy Don't track if is MergeStrategy.IgnoreChanges
   * @param keys The primary keys of the entities to delete.
   * @param collection The entity collection
   */
  trackDeleteMany(mergeStrategy: MergeStrategy, keys: (number | string)[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Track multiple entity updates of the same change type.
   * Does NOT update the collection (the reducer's job).
   * Call before the updates.
   * @param mergeStrategy Don't track if is MergeStrategy.IgnoreChanges
   * @param updates The entities to update.
   * @param collection The entity collection
   */
  trackUpdateMany(mergeStrategy: MergeStrategy, updates: Update<T>[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Track multiple entity upserts (adds and updates).
   * Does NOT update the collection (the reducer's job).
   * @param mergeStrategy Don't track if is MergeStrategy.IgnoreChanges
   * @param entities The entities to add or update. They must be complete entities with ids.
   * @param collection The entity collection
   */
  trackUpsertMany(mergeStrategy: MergeStrategy, entities: T[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Revert the unsaved changes for the given entities.
   * Harmless when there are no entities to undo.
   * @param entityOrId The entities to revert or their ids.
   * @param collection The entity collection
   */
  undoMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Revert the unsaved changes for all collection.
   * Harmless when there are no entities to undo.
   * @param collection The entity collection
   */
  undoAll(collection: EntityCollection<T>): EntityCollection<T>;
}
