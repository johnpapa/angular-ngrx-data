import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { EntityOp, OP_NO_TRACK } from './entity-op';

export interface EntityAction<P = any> extends Action {
  readonly type: string;
  readonly entityName: string;
  readonly op: EntityOp;
  readonly payload?: P;

  /** The tag to use in the action's type. The entityName if no tag specified. */
  readonly tag?: string;

  //////// The following are mutable properties. /////

  // Mutable actions are BAD.
  // Unfortunately, these mutations are the only way to stop @ngrx/effects
  // from processing these actions.
  /**
   * The action was determined (usually by a reducer) to be in error.
   * Downstream effects should not process but rather treat it as an error.
   */
  error?: Error;

  /**
   * Downstream effects should skip processing this action but should return
   * an innocuous Observable<Action> of success.
   */
  skip?: boolean;
}

@Injectable()
export class EntityActionFactory {
  create<P = any>(nameOrAction: string | EntityAction, op?: EntityOp, payload?: P, tag?: string): EntityAction<P> {
    let entityName: string;
    let error: any;
    let skip: boolean;

    if (typeof nameOrAction === 'string') {
      if (nameOrAction == null) {
        throw new Error('Missing entity name for new action');
      }
      if (op == null) {
        throw new Error('Missing EntityOp for new action');
      }
      entityName = nameOrAction.trim();
    } else {
      // is an EntityAction
      entityName = nameOrAction.entityName;
      tag = tag || nameOrAction.tag;
      op = op || nameOrAction.op;
      if (arguments.length < 3) {
        payload = nameOrAction.payload;
      }
      error = nameOrAction.error;
      skip = nameOrAction.skip;
    }
    tag = (tag || entityName).trim();
    const type = this.formatActionType(op, tag);
    const action: EntityAction<P> = { type, entityName, op, payload, tag, error };
    if (error) {
      // Only add error property if it exists.
      action.error = error;
    }
    if (skip) {
      // Only add skip property if it exists.
      action.skip = skip;
    }
    return action;
  }

  formatActionType(op: string, tag: string) {
    return `[${tag}] ${op}`;
    // return `${op} [${tag}]`.toUpperCase(); // an alternative
  }
}
