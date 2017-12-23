import { Store } from '@ngrx/store';

import { EntityAction, EntityOp } from './entity.actions';
import { EntityCache } from './interfaces';
import { IdSelector, Update } from './ngrx-entity-models';

/**
 * Dispatches Entity-related commands to effects and reducers
 */
export class EntityDispatcher<T> {
  constructor(
    private entityName: string,
    private store: Store<EntityCache>,
    private selectId: IdSelector<T> = (entity: any) => entity.id
  ) {}

  private dispatch(op: EntityOp, payload?: any) {
    this.store.dispatch(new EntityAction(this.entityName, op, payload));
  }

  /**
   * Convert an entity (or partial entity) into the `Update<T>` object
   * `id`: the primary key and
   * `changes`: the entity (or partial entity of changes).
   */
  private toUpdate: (entity: Partial<T>) => Update<T> = (entity: T) => ({
    id: this.selectId(entity) as string,
    changes: entity
  });

  /**
   * Save a new entity to remote storage.
   * Does not add to cache until save succeeds.
   * Ignored by cache-add if the entity is already in cache.
   */
  add(entity: T) {
    this.dispatch(EntityOp.SAVE_ADD, entity);
  }

  /** Clear the cached entity collection */
  clear() {
    this.dispatch(EntityOp.REMOVE_ALL);
  }

  /**
   * Removes entity from the cache by key
   * and deletes entity from remote storage by key.
   * Does not restore to cache if the delete fails.
   * */
  delete(key: string | number) {
    this.dispatch(EntityOp.SAVE_DELETE, key);
  }

  /**
   * Query remote storage for all entities and
   * completely replace the cached collection with the queried entities.
   */
  getAll() {
    this.dispatch(EntityOp.QUERY_ALL);
  }

  /**
   * Query remote storage for the entity with this primary key
   * and replace the cached entity with the result if found.
   */
  getByKey(key: any) {
    this.dispatch(EntityOp.QUERY_BY_KEY, key);
  }

  /**
   * Save the updated entity (or partial entity) to remote storage.
   * Updates the cached entity after the save succeeds.
   * Update in cache is ignored if the entity's key is not found in cache.
   * The update entity may be partial (but must have its key)
   * in which case it patches the existing entity.
   */
  update(entity: Partial<T>) {
    // update entity might be a partial of T but must at least have its key.
    // pass the Update<T> structure as the payload
    const update: Update<T> = this.toUpdate(entity);
    this.dispatch(EntityOp.SAVE_UPDATE, update);
  }

  /**
   * Set the pattern that the collection's filter applies
   * when using the `filteredEntities` selector.
   */
  setFilter(pattern: any) {
    this.dispatch(EntityOp.SET_FILTER, pattern);
  }
}
