import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { DataServiceError, EntityActionDataServiceError } from './data-service-error';
import { EntityAction, EntityActionFactory } from '../actions/entity-action';
import { EntityOp, OP_ERROR, OP_SUCCESS } from '../actions/entity-op';

/**
 * Handling of responses from persistence operation
 */
export abstract class PersistenceResultHandler {
  /** Handle successful result of persistence operation for an action */
  abstract handleSuccess(action: EntityAction): (data: any) => Action;

  /** Handle error result of persistence operation for an action */
  abstract handleError(action: EntityAction):
  (error: DataServiceError | Error) => Observable<Action>
}

/**
 * Default handling of responses from persistence operation,
 * specifically an EntityDataService
 */
@Injectable()
export class DefaultPersistenceResultHandler implements PersistenceResultHandler {
  constructor(private entityActionFactory: EntityActionFactory) {}

  /** Handle successful result of persistence operation on an EntityAction */
  handleSuccess(action: EntityAction | EntityAction): (data: any) => Action {
    const successOp = <EntityOp>(action.op + OP_SUCCESS);
    return (data: any) =>
      this.entityActionFactory.create(action as EntityAction, successOp, data);
  }

  /** Handle error result of persistence operation on an EntityAction */
  handleError(action: EntityAction | EntityAction):
    (error: DataServiceError) => Observable<EntityAction<EntityActionDataServiceError>> {

    const errorOp = <EntityOp>(action.op + OP_ERROR);
    return (error: DataServiceError | Error) => {
      if (error instanceof Error) {
        error = new DataServiceError(error, null);
      }
      return of(
        this.entityActionFactory.create<EntityActionDataServiceError>(
          action as EntityAction,
          errorOp,
          { originalAction: action as EntityAction, error }
        )
      );
    };
  }
}
