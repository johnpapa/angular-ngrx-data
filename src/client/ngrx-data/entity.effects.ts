import { Injectable } from '@angular/core';

import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { concatMap, catchError, filter, mergeMap, tap } from 'rxjs/operators';

import {
  DataServiceError,
  EntityDataService,
  EntityAction,
  EntityCache,
  EntityCollectionDataService,
  EntityOp
} from './interfaces';

import * as EntityActions from './entity.actions';

type eaType = EntityAction<any, any>;

const persistOps = [
  EntityActions.GET_ALL,
  EntityActions.GET_BY_ID,
  EntityActions.ADD,
  EntityActions.DELETE,
  EntityActions.UPDATE
];

// filter for EntityActions with a persistable EntityOp
function isPersistOp(action: eaType) {
  return action.op && persistOps.some(op => op === action.op)
}

@Injectable()
export class EntityEffects {

  @Effect()
  persist$: Observable<Action> = this.actions$
    .pipe(
      filter(isPersistOp),
      concatMap(action =>
        this.doService(action).pipe(
          mergeMap(handleSuccess(action)),
          catchError(handleError(action))
        )
      )
    );

  private doService(action: eaType) {
    const service = this.dataService.getService(action.entityTypeName);
    switch (action.op) {
      case EntityActions.GET_ALL: {
        return service.getAll(action.payload);
      }
      case EntityActions.GET_BY_ID: {
        return service.getById(action.payload);
      }
      case EntityActions.ADD: {
        return service.add(action.payload);
      }
      case EntityActions.DELETE: {
        return service.delete(action.payload);
      }
      case EntityActions.UPDATE: {
        return service.update(action.payload);
      }
      default:
        throw new Error(`Action ${action.op} is not implemented.`);
    }
  }

  constructor(
    private store: Store<EntityCache>,
    private actions$: Actions,
    private dataService: EntityDataService
  ) {}
}

function handleSuccess(action: eaType) {
  const successOp = <EntityOp>(action.op + '_SUCCESS');

  const filteredAction = new EntityAction<any, any>(action.entityType, EntityActions.GET_FILTERED);

  return (data: any) => [
    new EntityAction<any, any>(action.entityType, successOp, data),
    filteredAction
  ];
}

function handleError(action: eaType) {
  const errorOp = <EntityOp>(action.op + '_ERROR');

  return (err: DataServiceError<any>) =>
    of(new EntityAction<any, any>(action.entityType, errorOp, err));
}
