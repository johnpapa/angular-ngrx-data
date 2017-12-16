import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { EntityAdapter } from '@ngrx/entity';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { concat, concatMap, catchError, filter, map, startWith, tap } from 'rxjs/operators';

import { DataServiceError } from './interfaces';
import { EntityAction, EntityOp } from './entity.actions';
import { EntityDataService } from './entity-data.service';

type eaType = EntityAction<any, any>;

const persistOps = [
  EntityOp.QUERY_ALL,
  EntityOp.QUERY_BY_KEY,
  EntityOp.SAVE_ADD,
  EntityOp.SAVE_DELETE,
  EntityOp.SAVE_UPDATE
];

// filter for EntityActions with a persistable EntityOp
function isPersistOp(action: eaType) {
  return action.op && persistOps.some(op => op === action.op);
}

@Injectable()
export class EntityEffects {
  @Effect()
  persist$ = this.actions$.pipe(filter(isPersistOp), concatMap(action => this.persist(action)));

  private persist(action: eaType) {
    try {
      return this.callDataService(action).pipe(
        map(handleSuccess(action)),
        catchError(handleError(action))
      );
    } catch (err) {
      return handleError(action)(err);
    }
  }

  private callDataService(action: eaType) {
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

  constructor(private actions$: Actions, private dataService: EntityDataService) {}
}

function handleSuccess(action: eaType) {
  const successOp = <EntityOp>(action.op + '_SUCCESS');
  return (data: any) => new EntityAction(action, successOp, data);
}

function handleError(action: eaType) {
  const errorOp = <EntityOp>(action.op + '_ERROR');
  return (error: DataServiceError<any>) =>
    of(new EntityAction(action, errorOp, { originalAction: action, error }));
}
