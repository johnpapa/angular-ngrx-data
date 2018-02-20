import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import { filter, share, takeUntil } from 'rxjs/operators';

import { DataServiceError } from './interfaces';
import { flattenArgs } from './utils';

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

  SAVE_ADD_OPTIMISTIC = 'SAVE_ADD_OPTIMISTIC',
  SAVE_ADD_OPTIMISTIC_ERROR = 'SAVE_ADD_OPTIMISTIC_ERROR',
  SAVE_ADD_OPTIMISTIC_SUCCESS = 'SAVE_ADD_OPTIMISTIC_SUCCESS',

  SAVE_DELETE_OPTIMISTIC = 'SAVE_DELETE_OPTIMISTIC',
  SAVE_DELETE_OPTIMISTIC_SUCCESS = 'SAVE_DELETE_OPTIMISTIC_SUCCESS',
  SAVE_DELETE_OPTIMISTIC_ERROR = 'SAVE_DELETE_OPTIMISTIC_ERROR',

  SAVE_UPDATE_OPTIMISTIC = 'SAVE_UPDATE_OPTIMISTIC',
  SAVE_UPDATE_OPTIMISTIC_SUCCESS = 'SAVE_UPDATE_OPTIMISTIC_SUCCESS',
  SAVE_UPDATE_OPTIMISTIC_ERROR = 'SAVE_UPDATE_OPTIMISTIC_ERROR',

  // Cache actions
  ADD_ALL = 'ADD_ALL',
  ADD_MANY = 'ADD_MANY',
  ADD_ONE = 'ADD_ONE',
  REMOVE_MANY = 'REMOVE_MANY',
  REMOVE_ONE = 'REMOVE_ONE',
  REMOVE_ALL = 'REMOVE_ALL',
  UPDATE_MANY = 'UPDATE_MANY',
  UPDATE_ONE = 'UPDATE_ONE',
  UPSERT_MANY = 'UPSERT_MANY',
  UPSERT_ONE = 'UPSERT_ONE',

  SET_FILTER = 'SET_FILTER',
}

export interface EntityAction<P = any> extends Action {
  readonly type: string;
  readonly entityName: string;
  readonly op: EntityOp;
  readonly payload?: any;
  // The only mutable property because
  // it's the only way to stop downstream action processing
  error?: Error;
}

/** "Success" suffix appended to EntityOps that are successful.*/
export const OP_SUCCESS = '_SUCCESS';
/** "Error" suffix appended to EntityOps that have failed.*/
export const OP_ERROR = '_ERROR'

@Injectable()
export class EntityActionFactory {
  create<P = any>(
    nameOrAction: string | EntityAction,
    op?: EntityOp,
    payload?: P,
    error?: Error
  ) {
    let entityName: string;

    if (typeof nameOrAction === 'string') {
      if (nameOrAction == null) {
        throw new Error('Missing entity name for new action')
      };
      if (op == null) {
        throw new Error('Missing EntityOp for new action');
      }
      entityName = nameOrAction.trim();
    } else { // is an EntityAction
      entityName = nameOrAction.entityName;
      op = op || nameOrAction.op;
      if (arguments.length < 3) {
        payload = nameOrAction.payload;
      }
    }
    const type = this.formatActionType(op, entityName);
    return error ?
      { type, entityName, op, payload, error } :
      { type, entityName, op, payload };
  }

  formatActionType(op: string, entityName: string) {
    return `${op} [${entityName}]`.toUpperCase();
    // return `[${entityName}] ${op.toUpperCase()} `; // an alternative
  }
}

/** Payload for an EntityAction data service error such as QUERY_ALL_ERROR */
export interface EntityActionDataServiceError {
  originalAction: EntityAction;
  error: DataServiceError;
}

/**
 * Observable of entity actions dispatched to the store.
 * EntityAction-oriented filter operators for ease-of-use.
 * Imitates `Actions.ofType()` in ngrx/entity.
 */
@Injectable()
export class EntityActions<V extends EntityAction = EntityAction> extends Observable<V> {
  // Inject the ngrx/entity Actions observable that watches dispatches to the store
  constructor(source?: Actions) {
    super();

    if (source) {
      this.source = source;
    }
  }

  // Can't name it `filter` because of `import 'rxjs/add/operator/filter';` (issue 97).
  // 'where' was an alias for `filter` long ago but no import risk now.

  /**
   * Filter EntityActions based on a predicate.
   * @param predicate -returns true if EntityAction passes the test.
   * Example:
   *  this.actions$.where(ea => ea.op.includes(EntityAction.OP_SUCCESS)) // Successful hero action
   */
  where(predicate: (ea: EntityAction) => boolean) {
    return filter(predicate)(this) as EntityActions;
  }

  lift<R>(operator: Operator<V, R>): Observable<R> {
    const observable = new EntityActions();
    observable.source = this;
    // "Force-casts" below because can't change signature of Lift.
    observable.operator = <Operator<any, EntityAction>>(<any>operator);
    return <Observable<R>>(<any>observable);
  }

  /**
   * Entity actions concerning any of the given entity types
   * @param allowedEntityNames - names of entities whose actions should pass through.
   * Example:
   * ```
   *  this.actions$.ofEntityType() // an EntityAction of any entity type
   *  this.actions$.ofEntityType('Hero') // EntityActions for the Hero entity
   *  this.actions$.ofEntityType('Hero', 'Villain', 'Sidekick')
   *  this.actions$.ofEntityType(...theChosen)
   *  this.actions$.ofEntityType(theChosen)
   * ```
   */
  ofEntityType(allowedEntityNames?: string[]): EntityActions;
  ofEntityType(...allowedEntityNames: string[]): EntityActions;
  ofEntityType(...allowedEntityNames: any[]): EntityActions {
    const names: string[] = flattenArgs(allowedEntityNames);
    switch (names.length) {
      case 0:
        return this.where(ea => !!ea.entityName);
      case 1:
        const name = names[0];
        return this.where(ea => name === ea.entityName);
      default:
        return this.where(ea => ea.entityName && names.some(n => n === ea.entityName));
    }
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
    return this.where(ea => ea.op && ops.some(op => op === ea.op));
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
  ofType(allowedTypes: string[]): EntityActions;
  ofType(...allowedTypes: string[]): EntityActions;
  ofType(...allowedTypes: any[]): EntityActions {
    const types: string[] = flattenArgs(allowedTypes);
    return this.where(ea => !!ea.entityName && types.some(type => type === ea.type));
  }

  /**
   * Continue emitting actions until the `notifier` says stop.
   * When the `notifier` emits a next value, this observable completes
   * and subscribers are unsubscribed.
   * Uses RxJS `takeUntil().`
   * @param notifier - observable that stops the source with a `next()`.
   * Example:
   *  this.actions$.ofEntityType('Hero').until(this.onDestroy);
   */
  until(notifier: Observable<any>): EntityActions {
    return takeUntil<EntityAction>(notifier)(this) as EntityActions;
  }
}
