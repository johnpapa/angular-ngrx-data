import { QueryParams } from '../dataservices/interfaces';

/*** Commands that update the remote server ***/
export interface EntityServerCommands<T> {

  /**
   * Save a new entity to remote storage.
   * Does not add to cache until save succeeds.
   * Ignored by cache-add if the entity is already in cache.
   */
  add(entity: T, isOptimistic?: boolean): void;

  /**
   * Removes entity from the cache by key (if it is in the cache).
   * and deletes entity from remote storage by key.
   * Does not restore to cache if the delete fails.
   * @param key The primary key of the entity to remove
   */
  delete(key: number | string, isOptimistic?: boolean): void;

  /**
   * Removes entity from the cache (if it is in the cache)
   * and deletes entity from remote storage by key.
   * Does not restore to cache if the delete fails.
   * @param entity The entity to remove
   */
  delete(entity: T, isOptimistic?: boolean): void

  /**
   * Query remote storage for all entities and
   * completely replace the cached collection with the queried entities.
   */
  getAll(): void;

  /**
   * Query remote storage for the entity with this primary key.
   * If the server returns an entity,
   * merge it into the cached collection.
   */
  getByKey(key: any): void;

  /**
   * Query remote storage for the entities that satisfy a query expressed
   * with either a query parameter map or an HTTP URL query string.
   * and merge the results into the cached collection.
   */
  getWithQuery(queryParams: QueryParams | string): void

  /**
   * Save the updated entity (or partial entity) to remote storage.
   * Updates the cached entity after the save succeeds.
   * Update in cache is ignored if the entity's key is not found in cache.
   * The update entity may be partial (but must have its key)
   * in which case it patches the existing entity.
   */
  update(entity: Partial<T>, isOptimistic?: boolean): void;
}

/*** Cache-only commands that do not update remote storage ***/
export interface EntityCacheCommands<T> {
  /**
   * Replace all entities in the cached collection.
   * Does not save to remote storage.
   */
  addAllToCache(entities: T[]): void;

  /**
   * Add a new entity directly to the cache.
   * Does not save to remote storage.
   * Ignored if an entity with the same primary key is already in cache.
   */
  addOneToCache(entity: T): void;

  /**
   * Add multiple new entities directly to the cache.
   * Does not save to remote storage.
   * Entities with primary keys already in cache are ignored.
   */
  addManyToCache(entities: T[]): void;

  /** Clear the cached entity collection */
  clearCache(): void;

  /**
   * Remove an entity directly from the cache.
   * Does not delete that entity from remote storage.
   * @param entity The entity to remove
   */
  removeOneFromCache(entity: T): void

  /**
   * Remove an entity directly from the cache.
   * Does not delete that entity from remote storage.
   * @param key The primary key of the entity to remove
   */
  removeOneFromCache(key: number | string): void

  /**
   * Remove multiple entities directly from the cache.
   * Does not delete these entities from remote storage.
   * @param entity The entities to remove
   */
  removeManyFromCache(entities: T[]): void

  /**
   * Remove multiple entities directly from the cache.
   * Does not delete these entities from remote storage.
   * @param keys The primary keys of the entities to remove
   */
  removeManyFromCache(keys: (number | string)[]): void

  /**
   * Update a cached entity directly.
   * Does not update that entity in remote storage.
   * Ignored if an entity with matching primary key is not in cache.
   * The update entity may be partial (but must have its key)
   * in which case it patches the existing entity.
   */
  updateOneInCache(entity: Partial<T>): void;

  /**
   * Update multiple cached entities directly.
   * Does not update these entities in remote storage.
   * Entities whose primary keys are not in cache are ignored.
   * Update entities may be partial but must at least have their keys.
   * such partial entities patch their cached counterparts.
   */
  updateManyInCache(entities: Partial<T>[]): void;

  /**
   * Insert or update a cached entity directly.
   * Does not save to remote storage.
   * Upsert entity might be a partial of T but must at least have its key.
   * Pass the Update<T> structure as the payload
   */
  upsertOneInCache(entity: Partial<T>): void;

  /**
   * Insert or update multiple cached entities directly.
   * Does not save to remote storage.
   * Upsert entities might be partial but must at least have their keys.
   * Pass an array of the Update<T> structure as the payload
   */
  upsertManyInCache(entities: Partial<T>[]): void;

  /**
   * Set the pattern that the collection's filter applies
   * when using the `filteredEntities` selector.
   */
  setFilter(pattern: any): void;
}

/**
 * Interface for ngrx-data entity commands that
 * dispatch entity actions to the ngrx store.
 */
export interface EntityCommands<T> extends EntityServerCommands<T>, EntityCacheCommands<T> { }

// TypeScript bug: have to export something real in JavaScript
export const __dummy__: any = undefined;
