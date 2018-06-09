import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { Observable, of } from 'rxjs';

import { DataServiceError, EntityActionDataServiceError } from './data-service-error';
import { EntityAction } from '../actions/entity-action';
import { EntityActionFactory } from '../actions/entity-action-factory';
import { EntityOp, OP_ERROR, OP_SUCCESS } from '../actions/entity-op';
import { Logger } from '../utils/interfaces';

/**
 * Handling of responses from persistence operation
 */
export abstract class PersistenceResultHandler {
  /** Handle successful result of persistence operation for an action */
  abstract handleSuccess(originalAction: EntityAction): (data: any) => Action;

  /** Handle error result of persistence operation for an action */
  abstract handleError(originalAction: EntityAction): (error: DataServiceError | Error) => EntityAction<EntityActionDataServiceError>;
}

/**
 * Default handling of responses from persistence operation,
 * specifically an EntityDataService
 */
@Injectable()
export class DefaultPersistenceResultHandler implements PersistenceResultHandler {
  constructor(private logger: Logger, private entityActionFactory: EntityActionFactory) {}

  /** Handle successful result of persistence operation on an EntityAction */
  handleSuccess(originalAction: EntityAction): (data: any) => Action {
    const successOp = <EntityOp>(originalAction.payload.op + OP_SUCCESS);
    return (data: any) => this.entityActionFactory.createFromAction(originalAction, { op: successOp, data });
  }

  /** Handle error result of persistence operation on an EntityAction */
  handleError(originalAction: EntityAction): (error: DataServiceError | Error) => EntityAction<EntityActionDataServiceError> {
    const errorOp = <EntityOp>(originalAction.payload.op + OP_ERROR);
    return (error: DataServiceError | Error) => {
      if (error instanceof Error) {
        error = new DataServiceError(error, null);
      }
      this.logger.error(error);
      const errorAction = this.entityActionFactory.createFromAction<EntityActionDataServiceError>(originalAction, {
        op: errorOp,
        data: { error, originalAction }
      });
      return errorAction;
    };
  }
}
