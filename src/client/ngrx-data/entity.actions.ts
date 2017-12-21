import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { flattenArgs } from './interfaces';

import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import { filter, share, takeUntil } from 'rxjs/operators';

// General purpose entity action types, good for any entity type
export enum EntityOp {
  // Persisting Actions (more to come)
  QUERY_ALL = 'QUERY_ALL',
  QUERY_ALL_SUCCESS = 'QUERY_ALL_SUCCESS',
  QUERY_ALL_ERROR = 'QUERY_ALL_ERROR',

  QUERY_MANY = 'QUERY_MANY',
  QUERY_MANY_SUCCESS = 'QUERY_MANY_SUCCESS',
  QUERY_MANY_ERROR = 'QUERY_MANY_ERROR',

  QUERY_BY_KEY = 'QUERY_BY_ID',
  QUERY_BY_KEY_SUCCESS = 'QUERY_BY_ID_SUCCESS',
  QUERY_BY_KEY_ERROR = 'QUERY_BY_ID_ERROR',

  SAVE_ADD = 'SAVE_ADD',
  SAVE_ADD_ERROR = 'SAVE_ADD_ERROR',
  SAVE_ADD_SUCCESS = 'SAVE_ADD_SUCCESS',

  SAVE_DELETE = 'SAVE_DELETE',
  SAVE_DELETE_SUCCESS = 'SAVE_DELETE_SUCCESS',
  SAVE_DELETE_ERROR = 'SAVE_DELETE_ERROR',

  SAVE_UPDATE = 'SAVE_UPDATE',
  SAVE_UPDATE_SUCCESS = 'SAVE_UPDATE_SUCCESS',
  SAVE_UPDATE_ERROR = 'SAVE_UPDATE_ERROR',

  // Cache actions
  ADD_ALL = 'ADD_ALL',
  ADD_MANY = 'ADD_MANY',
  ADD_ONE = 'ADD_ONE',
  REMOVE_MANY = 'REMOVE_MANY',
  REMOVE_ONE = 'REMOVE_ONE',
  REMOVE_ALL = 'REMOVE_ALL',
  UPDATE_MANY = 'UPDATE_MANY',
  UPDATE_ONE = 'UPDATE_ONE',

  SET_FILTER = 'SET_FILTER'
}

/** "Success" suffix appended to EntityOps that are successful.*/
export const OP_SUCCESS = '_SUCCESS';

/** "Error" suffix appended to EntityOps that have failed.*/
export const OP_ERROR = '_ERROR';

export class EntityAction<T extends Object = Object, P = any> implements Action {
  readonly type: string;
  readonly entityName: string;

  static formatActionTypeName(op: string, entityName: string) {
    return `${op} [${entityName}]`.toUpperCase();
    // return `[${entityName}] ${op.toUpperCase()} `; // an alternative
  }

  constructor(
    nameOrAction: string | EntityAction<T, any>,
    public readonly op: EntityOp,
    public readonly payload?: P
  ) {
    this.entityName = (nameOrAction instanceof EntityAction
      ? nameOrAction.entityName
      : nameOrAction
    ).trim();
    this.type = EntityAction.formatActionTypeName(op, this.entityName);
  }
}

/**
 * Observable of entity actions dispatched to the store.
 * EntityAction-oriented filter operators for ease-of-use.
 * Imitates `Actions.ofType()` in ngrx/entity.
 */
@Injectable()
export class EntityActions<V = any> extends Observable<EntityAction<V>> {
  // Inject the ngrx/entity Actions observable that watches dispatches to the store
  constructor(source?: Actions) {
    super();

    if (source) {
      this.source = source;
    }
  }

  /**
   * Filter actions based on a predicate.
   * @param predicate -returns true if EntityAction passes the test.
   * Example:
   *  this.actions$.filter<Hero>(ea => ea.op.includes(OP_SUCCESS)) // Successful hero action
   */
  filter<T>(predicate: (ea: EntityAction<T>) => boolean) {
    return filter(predicate)(this) as EntityActions<T>;
  }

  lift<R>(operator: Operator<V, R>): Observable<R> {
    const observable = new EntityActions();
    observable.source = this;
    // "Force-casts" below because can't change signature of Lift.
    observable.operator = <Operator<any, EntityAction>>(<any>operator);
    return <Observable<R>>(<any>observable);
  }

  /**
   * Actions concerning any entity (excludes non-entity actions)
   * Example:
   *  this.actions$.ofEntity() // actions for  Heroes, Villains, ...
   */
  ofEntity<T>(): EntityActions<T> {
    return this.filter<T>(ea => !!ea.entityName);
  }

  /**
   * Entity actions of the given entity type
   * @param entityName - the entity type name or the entity class
   * Example:
   *  this.actions$.ofEntityType('Hero') // Hero entity, untyped
   *  this.actions$.ofEntityType<Hero>('Hero') // typed by Hero interface.
   */
  ofEntityType<T>(entityName: string): EntityActions<T> {
    entityName = entityName.trim();
    return this.filter<T>(ea => entityName === ea.entityName);
  }

  /**
   * Entity actions concerning any of the given entity types
   * @param allowedEntityNames - names of entities whose actions should pass through.
   * Example:
   * ```
   *  this.actions$.ofEntityTypes('Hero', 'Villain', 'Sidekick')
   *  this.actions$.ofEntityTypes(...theChosen)
   *  this.actions$.ofEntityTypes(theChosen)
   * ```
   */
  ofEntityTypes<T>(allowedEntityNames: string[]): EntityActions<T>;
  ofEntityTypes<T>(...allowedEntityNames: string[]): EntityActions<T>;
  ofEntityTypes<T>(...allowedEntityNames: any[]): EntityActions<T> {
    const names: string[] = flattenArgs(allowedEntityNames);
    return this.filter<T>(ea => ea.entityName && names.some(name => name === ea.entityName));
  }

  /**
   * Entity actions concerning any of the given `EntityOp`s
   * @param allowedOps - `EntityOp`s whose actions should pass through.
   * Example:
   * ```
   *  this.actions$.ofOp(EntityOp.QUERY_ALL, EntityOp.QUERY_MANY)
   *  this.actions$.ofOp(...queryOps)
   *  this.actions$.ofOp(queryOps)
   * ```
   */
  ofOp(allowedOps: string[] | EntityOp[]): EntityActions;
  ofOp(...allowedOps: (string | EntityOp)[]): EntityActions;
  ofOp(...allowedOps: any[]) {
    // string is the runtime type of an EntityOp enum
    const ops: string[] = flattenArgs(allowedOps);
    return this.filter(ea => ea.op && ops.some(op => op === ea.op));
  }

  /**
   * Entity actions of the given type(s)
   * @param allowedTypes - `Action.type`s whose actions should pass through.
   * Example:
   * ```
   *  this.actions$.ofTypes('GET_ALL_HEROES', 'GET_ALL_SIDEKICKS')
   *  this.actions$.ofTypes(...someTypes)
   *  this.actions$.ofTypes(someTypes)
   * ```
   */
  ofType<T>(allowedTypes: string[]): EntityActions<T>;
  ofType<T>(...allowedTypes: string[]): EntityActions<T>;
  ofType<T>(...allowedTypes: any[]): EntityActions<T> {
    const types: string[] = flattenArgs(allowedTypes);
    return this.filter<T>(ea => !!ea.entityName && types.some(type => type === ea.type));
  }

  /**
   * Continue emitting actions until the `notifier` says stop.
   * When the `notifier` emits a next value, this observable completes
   * and subscribers are unsubscribed.
   * Uses RxJS `takeUntil().`
   * @param notifier - observable that stops the source with a `next()`.
   * Example:
   *  this.actions$.ofEntityType<Hero>('Hero').until<Hero>(this.onDestroy);
   */
  until<T>(notifier: Observable<any>): EntityActions<T> {
    return takeUntil<EntityAction<T>>(notifier)(this) as EntityActions<T>;
  }
}
