import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as EntityActions from './entity.actions';
import { EntityAction, EntityCache, EntityClass, EntityOp, getEntityName } from './interfaces';

@Injectable()
export class EntityDispatchers {
  private dispatchers: { [name: string]: EntityDispatcher<any> } = {};

  constructor(private store: Store<EntityCache>) {}

  /**
   * Get (or create) a dispatcher for entity type
   * @param entityClass - the class or the name of the class (which must have a dispatcher)
   *
   * Examples:
   *   getDispatcher(Hero);  // dispatcher for Heroes, typed as Hero
   *   getDispatcher('Hero'); // dispatcher for Heroes, untyped
   */
  getDispatcher<T>(entityClass: EntityClass<T> | string): EntityDispatcher<T> {
    const entityName = getEntityName(entityClass);
    let dispatcher = this.dispatchers[entityName];
    if (!dispatcher) {
      if (typeof entityClass === 'string') {
        throw new Error(`No dispatcher for ${entityName} and cannot create one without the class.`);
      }
      dispatcher = new EntityDispatcher<T>(entityClass, this.store);
      this.dispatchers[entityName] = dispatcher;
    }
    return dispatcher;
  }

  /**
   * Register a dispatcher for an entity class
   * @param entityClass - the name of the entity class or the class itself
   * @param dispatcher - dispatcher for that entity class
   *
   * Examples:
   *   registerDispatcher(Hero, MyHeroDispatcher);
   *   registerDispatcher('Villain', MyVillainDispatcher);
   */
  registerDispatcher<T>(entityClass: string | EntityClass<T>, dispatcher: EntityDispatcher<T>) {
    this.dispatchers[getEntityName(entityClass)] = dispatcher;
  }

  /**
   * Register a batch of dispatchers.
   * @param dispatchers - dispatchers to merge into existing dispatchers
   *
   * Examples:
   *   registerDispatchers({
   *     Hero: MyHeroDispatcher,
   *     Villain: MyVillainDispatcher
   *   });
   */
  registerDispatchers(dispatchers: { [name: string]: EntityDispatcher<any> }) {
    this.dispatchers = { ...this.dispatchers, ...dispatchers };
  }
}

export class EntityDispatcher<T> {
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
