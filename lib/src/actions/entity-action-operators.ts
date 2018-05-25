import { Action } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

import { Observable, OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

import { EntityAction } from './entity-action';
import { EntityOp } from './entity-op';
import { flattenArgs } from '../utils/utilities';

/**
 * Select actions concerning one of the allowed Entity operations
 * @param allowedEntityOps Entity operations (e.g, EntityOp.QUERY_ALL) whose actions should be selected
 * Example:
 * ```
 *  this.actions.pipe(ofEntityOp(EntityOp.QUERY_ALL, EntityOp.QUERY_MANY), ...)
 *  this.actions.pipe(ofEntityOp(...queryOps), ...)
 *  this.actions.pipe(ofEntityOp(queryOps), ...)
 *  this.actions.pipe(ofEntityOp(), ...) // any action with a defined `op` property
 * ```
 */
export function ofEntityOp<T extends EntityAction>(
  allowedOps: string[] | EntityOp[]
): OperatorFunction<EntityAction, T>;
export function ofEntityOp<T extends EntityAction>(
  ...allowedOps: (string | EntityOp)[]
): OperatorFunction<EntityAction, T>;
export function ofEntityOp<T extends EntityAction>(
  ...allowedEntityOps: any[]
): OperatorFunction<EntityAction, T> {
  const ops: string[] = flattenArgs(allowedEntityOps);
  switch (ops.length) {
    case 0:
      return filter((action: EntityAction): action is T => !!action.op);
    case 1:
      const op = ops[0];
      return filter((action: EntityAction): action is T => op === action.op);
    default:
      return filter((action: EntityAction): action is T =>
        ops.some(entityOp => entityOp === action.op)
      );
  }
}

/**
 * Select actions concerning one of the allowed Entity types
 * @param allowedEntityNames Entity-type names (e.g, 'Hero') whose actions should be selected
 * Example:
 * ```
 *  this.actions.pipe(ofEntityType(), ...) // ayn EntityAction with a defined entity type property
 *  this.actions.pipe(ofEntityType('Hero'), ...) // EntityActions for the Hero entity
 *  this.actions.pipe(ofEntityType('Hero', 'Villain', 'Sidekick'), ...)
 *  this.actions.pipe(ofEntityType(...theChosen), ...)
 *  this.actions.pipe(ofEntityType(theChosen), ...)
 * ```
 */
export function ofEntityType<T extends EntityAction>(
  allowedEntityNames?: string[]
): OperatorFunction<EntityAction, T>;
export function ofEntityType<T extends EntityAction>(
  ...allowedEntityNames: string[]
): OperatorFunction<EntityAction, T>;
export function ofEntityType<T extends EntityAction>(
  ...allowedEntityNames: any[]
): OperatorFunction<EntityAction, T> {
  const names: string[] = flattenArgs(allowedEntityNames);
  switch (names.length) {
    case 0:
      return filter((action: EntityAction): action is T => !!action.entityName);
    case 1:
      const name = names[0];
      return filter(
        (action: EntityAction): action is T => name === action.entityName
      );
    default:
      return filter((action: EntityAction): action is T =>
        names.some(entityName => entityName === action.entityName)
      );
  }
}
