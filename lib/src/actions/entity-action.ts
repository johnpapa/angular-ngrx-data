import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { EntityOp } from './entity-op';

export interface EntityAction<P = any> extends Action {
  readonly type: string;
  readonly entityName: string;
  readonly op: EntityOp;
  readonly payload?: P;
  // The only mutable property because
  // it's the only way to stop downstream action processing
  error?: Error;
}

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
    return `[${entityName}] ${op}`;
    // return `${op} [${entityName}]`.toUpperCase(); // an alternative
  }
}
