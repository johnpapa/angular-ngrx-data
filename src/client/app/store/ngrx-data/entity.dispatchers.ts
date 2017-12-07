import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as EntityActions from './entity.actions';
import { EntityAction, EntityCache, EntityClass, EntityOp } from './interfaces';

@Injectable()
export class EntityDispatchers<T> {
  constructor(private entityClass: EntityClass<T>, private store: Store<EntityCache>) {}

  private dispatch(op: EntityOp, payload?: any) {
    this.store.dispatch(new EntityAction(this.entityClass, op, payload));
  }

  add(entity: T) {
    this.dispatch(EntityActions.ADD, entity);
  }

  delete(entity: T) {
    this.dispatch(EntityActions.DELETE, entity);
  }

  getAll(options?: any) {
    this.dispatch(EntityActions.GET_ALL, options);
  }

  getById(id: any) {
    this.dispatch(EntityActions.GET_BY_ID, id);
  }

  save(entity: T, mode: 'add' | 'update') {
    if (mode === 'add') {
      this.dispatch(EntityActions.ADD, entity);
    } else {
      this.dispatch(EntityActions.UPDATE, entity);
    }
  }

  update(entity: T) {
    this.dispatch(EntityActions.UPDATE, entity);
  }

  getFiltered() {
    this.dispatch(EntityActions.GET_FILTERED);
  }

  setFilter(filter: string) {
    this.dispatch(EntityActions.SET_FILTER, filter);
  }
}
