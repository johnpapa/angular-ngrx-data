import { ChangeState, ChangeType, EntityCollection } from './entity-collection';

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
   * Commit changes for the given entity as when it has been refreshed from the server.
   * Harmless when there is no entity to untrack.
   * @param entityOrId The entity to clear tracking or its id.
   * @param collection The entity collection
   */
  commitOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Commit changes for the given entities as when they have been refreshed from the server.
   * Harmless when there are no entities to commit.
   * @param entityOrId The entities to clear tracking or their ids.
   * @param collection The entity collection
   */
  commitMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Track an entity add.
   * Call before adding the entity.
   * @param entity The entity to add. The entity must have its id.
   * @param collection The entity collection
   */
  trackAddOne(entity: T, collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Track multiple entity updates of the same change type
   * @param entities The entities to add. They must all have their ids.
   * @param collection The entity collection
   */
  trackAddMany(entities: T[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Track an entity removal with the intention of deleting it on the server.
   * Call before removing the entity.
   * @param entityOrId The entity or its id.
   * @param collection The entity collection
   */
  trackDeleteOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Track multiple removed entities with the intention of deleting them on the server.
   * Call before removing the entities
   * @param entityOrId The entities or their ids.
   * @param collection The entity collection
   */
  trackDeleteMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Track an entity change for the given entity.
   * Call before the update.
   * @param entityOrId The entity or its id.
   * @param collection The entity collection
   */
  trackUpdateOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Track multiple entity updates of the same change type.
   * Call before the updates.
   * @param entityOrId The entities or their ids.
   * @param collection The entity collection
   */
  trackUpdateMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Track an entity upsert (either an add or an update)
   * @param entity The entity to add or update. It must be complete, including its id.
   * @param collection The entity collection
   */
  trackUpsertOne(entity: T, collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Track multiple entity upserts (adds and updates).
   * @param entityOrId The entities to add or update. They must be complete entities with ids.
   * @param collection The entity collection
   */
  trackUpsertMany(entities: T[], collection: EntityCollection<T>): EntityCollection<T>;

  /**
   * Revert the unsaved change for the given entity.
   * Harmless if no entity to undo.
   * @param entityOrId The entity to revert or its id.
   * @param collection The entity collection
   */
  undoOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T>;

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

/** No-op EntityChangeTracker. All methods return the collection. Used when change tracking is disabled. */
export class NoopEntityChangeTracker<T> implements EntityChangeTracker<T> {
  commitAll(collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  commitOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  commitMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  trackAddOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  trackAddMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  trackDeleteOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  trackDeleteMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  trackUpdateOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  trackUpdateMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  trackUpsertOne(entity: T, collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  trackUpsertMany(entities: T[], collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  undoOne(entityOrId: number | string | T, collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  undoMany(entityOrIdList: (number | string | T)[], collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  undoAll(collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }
}
