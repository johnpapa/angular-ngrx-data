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

  add(entity: T) {
    this.dispatch(EntityOp.SAVE_ADD, entity);
  }

  delete(key: string | number) {
    this.dispatch(EntityOp.SAVE_DELETE, key);
  }

  getAll(options?: any) {
    this.dispatch(EntityOp.QUERY_ALL, options);
  }

  getById(id: any) {
    this.dispatch(EntityOp.QUERY_BY_KEY, id);
  }

  update(entity: T) {
    this.dispatch(EntityOp.SAVE_UPDATE, entity);
  }

  setFilter(filter: string) {
    this.dispatch(EntityOp.SET_FILTER, filter);
  }
}
