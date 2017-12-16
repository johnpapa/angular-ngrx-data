import { Store } from '@ngrx/store';

import { EntityAction, EntityOp } from './entity.actions';
import { EntityCache, EntityClass, getEntityName } from './interfaces';

/**
 * Dispatches Entity-related commands to effects and reducers
 */
export class EntityDispatcher<T> {
  constructor(private entityType: EntityClass<T> | string, private store: Store<EntityCache>) {}

  private dispatch(op: EntityOp, payload?: any) {
    this.store.dispatch(new EntityAction(this.entityType, op, payload));
  }

  /**
   * Add an entity to the cache.
   * Does not save to remote storage.
   * Ignored if the entity is already in cache.
   */
  add(entity: T) {
    this.dispatch(EntityOp.SAVE_ADD, entity);
  }

  /** Clear the cached entity collection */
  clear() {
    this.dispatch(EntityOp.REMOVE_ALL);
  }

  /** Remove an entity by key from the cache. Does not delete from remote storage. */
  delete(key: string | number) {
    this.dispatch(EntityOp.SAVE_DELETE, key);
  }

  /**
   * Query remote storage for all entities and
   * completely replace the cached collection with the queried entities.
   */
  getAll(options?: any) {
    this.dispatch(EntityOp.QUERY_ALL, options);
  }

  /**
   * Query remote storage for the entity with this primary key
   * and replace the cached entity with the result if found.
   */
  getByKey(key: any) {
    this.dispatch(EntityOp.QUERY_BY_KEY, key);
  }

  /**
   * Update the an entity to the cache.
   * Does not save to remote storage.
   * Ignored if the entity's key is not found in cache.
   * The update entity may be partial (but must have its key)
   * in which case it patches the existing entity.
   */
  update(entity: Partial<T>) {
    this.dispatch(EntityOp.SAVE_UPDATE, entity);
  }

  /**
   * Set the pattern that the collection's filter applies
   * when using the `filteredEntities` selector.
   */
  setFilter(pattern: any) {
    this.dispatch(EntityOp.SET_FILTER, pattern);
  }
}
