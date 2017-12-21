import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { EntityAdapter } from '@ngrx/entity';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { concat, concatMap, catchError, map, startWith, tap } from 'rxjs/operators';

import { DataServiceError } from './interfaces';
import { EntityAction, EntityActions, EntityOp, OP_ERROR, OP_SUCCESS } from './entity.actions';
import { EntityDataService } from './entity-data.service';

const persistOps = [
  EntityOp.QUERY_ALL,
  EntityOp.QUERY_BY_KEY,
  EntityOp.SAVE_ADD,
  EntityOp.SAVE_DELETE,
  EntityOp.SAVE_UPDATE
];

@Injectable()
export class EntityEffects {
  @Effect()
  persist$ = this.actions$.ofOp(persistOps).pipe(concatMap(action => this.persist(action)));

  private persist(action: EntityAction) {
    try {
      return this.callDataService(action).pipe(
        map(handleSuccess(action)),
        catchError(handleError(action))
      );
    } catch (err) {
      return handleError(action)(err);
    }
  }

  private callDataService(action: EntityAction) {
    const service = this.dataService.getService(action.entityName);
    switch (action.op) {
      case EntityOp.QUERY_ALL: {
        return service.getAll(action.payload);
      }
      case EntityOp.QUERY_BY_KEY: {
        return service.getById(action.payload);
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

  constructor(private actions$: EntityActions, private dataService: EntityDataService) {}
}

function handleSuccess(action: EntityAction) {
  const successOp = <EntityOp>(action.op + OP_SUCCESS);
  return (data: any) => new EntityAction(action, successOp, data);
}

function handleError(action: EntityAction) {
  const errorOp = <EntityOp>(action.op + OP_ERROR);
  return (error: DataServiceError<any>) =>
    of(new EntityAction(action, errorOp, { originalAction: action, error }));
}
