import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Effect } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { concatMap, catchError, map } from 'rxjs/operators';

import { EntityAction, EntityActionFactory } from '../actions/entity-action';
import { EntityActions } from '../actions/entity-actions';
import { EntityOp } from '../actions/entity-op';

import { EntityDataService } from '../dataservices/entity-data.service';
import { PersistenceResultHandler } from '../dataservices/persistence-result-handler.service';

export const persistOps: EntityOp[] = [
  EntityOp.QUERY_ALL,
  EntityOp.QUERY_BY_KEY,
  EntityOp.QUERY_MANY,
  EntityOp.SAVE_ADD_ONE,
  EntityOp.SAVE_DELETE_ONE,
  EntityOp.SAVE_UPDATE_ONE,
  EntityOp.SAVE_ADD_ONE_OPTIMISTIC,
  EntityOp.SAVE_DELETE_ONE_OPTIMISTIC,
  EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC
];

@Injectable()
export class EntityEffects {

  @Effect()
  // Concurrent persistence requests considered unsafe.
  // `concatMap` ensures each request must complete-or-fail before making the next request.
  persist$: Observable<Action> = this.actions$.ofOp(persistOps).pipe(concatMap(action => this.persist(action)));

  constructor(
    private actions$: EntityActions,
    private dataService: EntityDataService,
    private entityActionFactory: EntityActionFactory,
    private resultHandler: PersistenceResultHandler
  ) {}

  /**
   * Perform the requested persistence operation and return a completing Observable<Action>
   * that the effect should dispatch to the store after the server responds.
   * @param action A persistence operation EntityAction
   */
  persist(action: EntityAction): Observable<Action> {
    if (action.error) {
      return this.resultHandler.handleError(action)(action.error);
    }
    try {
      return this.callDataService(action).pipe(
        map(this.resultHandler.handleSuccess(action)),
        catchError(this.resultHandler.handleError(action))
      );
    } catch (err) {
      return this.resultHandler.handleError(action)(err);
    }
  }

  private callDataService(action: EntityAction) {
    const service = this.dataService.getService(action.entityName);
    switch (action.op) {
      case EntityOp.QUERY_ALL: {
        return service.getAll();
      }
      case EntityOp.QUERY_BY_KEY: {
        return service.getById(action.payload);
      }
      case EntityOp.QUERY_MANY: {
        return service.getWithQuery(action.payload);
      }
      case EntityOp.SAVE_ADD_ONE_OPTIMISTIC:
      case EntityOp.SAVE_ADD_ONE: {
        return service.add(action.payload);
      }
      case EntityOp.SAVE_DELETE_ONE_OPTIMISTIC:
      case EntityOp.SAVE_DELETE_ONE: {
        return service.delete(action.payload);
      }
      case EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC:
      case EntityOp.SAVE_UPDATE_ONE: {
        return service.update(action.payload);
      }
      default: {
        throw new Error(`Persistence action "${action.op}" is not implemented.`);
      }
    }
  }
}

