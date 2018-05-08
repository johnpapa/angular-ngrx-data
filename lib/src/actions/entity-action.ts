import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { EntityOp } from './entity-op';

export interface EntityAction<P = any> extends Action {
  readonly type: string;
  readonly entityName: string;
  readonly op: EntityOp;
  readonly payload?: P;
  /** The label to use in the action's type. The entityName if no label specified. */
  readonly label?: string;
  // The only mutable property because
  // it's the only way to stop downstream action processing
  /** The action was determined (usually by a reducer) to be in error and should not be processed. */
  error?: Error;
}

@Injectable()
export class EntityActionFactory {
  create<P = any>(
    nameOrAction: string | EntityAction,
    op?: EntityOp,
    payload?: P,
    label?: string,
    error?: Error
  ): EntityAction<P> {
    let entityName: string;

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
      label = label || nameOrAction.label;
      op = op || nameOrAction.op;
      if (arguments.length < 3) {
        payload = nameOrAction.payload;
      }
    }
    label = (label || entityName).trim();
    const type = this.formatActionType(op, label);
    return error
      ? { type, entityName, op, payload, label, error }
      : { type, entityName, op, payload, label };
  }

  formatActionType(op: string, label: string) {
    return `[${label}] ${op}`;
    // return `${op} [${label}]`.toUpperCase(); // an alternative
  }
}
