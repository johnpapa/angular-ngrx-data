import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import { filter, takeUntil } from 'rxjs/operators';

import { EntityAction } from './entity-action';
import { EntityOp } from './entity-op';
import { flattenArgs } from '../utils';

/**
 * Observable of entity actions dispatched to the store.
 * EntityAction-oriented filter operators for ease-of-use.
 * Imitates `Actions.ofType()` in ngrx/entity.
 */
@Injectable()
export class EntityActions<V extends EntityAction = EntityAction> extends Observable<V> {
  // Inject the ngrx/effect Actions observable that watches dispatches to the store
  constructor(source?: Actions) {
    super();

    if (source) {
      // ONLY look at EntityActions
      this.source = source.pipe(filter((action: any) => action.op && action.entityName));
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
    return this.where(ea => ops.some(op => op === ea.op));
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
    return this.where(ea => types.some(type => type === ea.type));
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
