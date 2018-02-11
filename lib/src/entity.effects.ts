import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { concatMap, catchError, map } from 'rxjs/operators';

import {
  EntityAction, EntityActionFactory, EntityActions,
  EntityOp
} from './entity.actions';
import { EntityDataService } from './entity-data.service';
import { PersistenceResultHandler } from './persistence-result-handler.service';

const persistOps: EntityOp[] = [
  EntityOp.QUERY_ALL,
  EntityOp.QUERY_BY_KEY,
  EntityOp.QUERY_MANY,
  EntityOp.SAVE_ADD,
  EntityOp.SAVE_DELETE,
  EntityOp.SAVE_UPDATE
];

@Injectable()
export class EntityEffects {

  @Effect()
  persist$ = this.actions$.ofOp(persistOps).pipe(concatMap(action => this.persist(action)));

  constructor(
    private actions$: EntityActions,
    private dataService: EntityDataService,
    private entityActionFactory: EntityActionFactory,
    private resultHandler: PersistenceResultHandler
  ) {}

  private persist(action: EntityAction) {
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
      case EntityOp.SAVE_ADD: {
        return service.add(action.payload);
      }
      case EntityOp.SAVE_DELETE: {
        return service.delete(action.payload);
      }
      case EntityOp.SAVE_UPDATE: {
        return service.update(action.payload);
      }
      default: {
        throw new Error(`Persistence action "${action.op}" is not implemented.`);
      }
    }
  }
}

