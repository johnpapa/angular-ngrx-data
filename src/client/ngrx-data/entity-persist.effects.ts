import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { concat, concatMap, catchError, filter, map, startWith, tap } from 'rxjs/operators';

import { EntityAction, EntityOp } from './entity.actions';
import { DataServiceError, EntityCache, EntityCollectionDataService } from './interfaces';

type eaType = EntityAction<any, any>;

import { EntityDataService } from './entity-data.service';

const persistOps = [
  EntityOp.GET_ALL,
  EntityOp.GET_BY_ID,
  EntityOp.ADD,
  EntityOp._DELETE,
  EntityOp.UPDATE
];

// filter for EntityActions with a persistable EntityOp
function isPersistOp(action: eaType) {
  return action.op && persistOps.some(op => op === action.op);
}

@Injectable()
export class EntityPersistEffects {
  @Effect()
  persist$ = this.actions$.pipe(filter(isPersistOp), concatMap(action => this.persist(action)));

  private persist(action: eaType) {
    try {
      return this.callDataService(action).pipe(
        map(handleSuccess(action)),
        catchError(handleError(action)),
        startWith(new EntityAction(action, EntityOp.SET_LOADING, true)),
        concat([
          new EntityAction(action, EntityOp.SET_LOADING, false),
          new EntityAction(action, EntityOp.GET_FILTERED)
        ])
      );
    } catch (err) {
      return handleError(action)(err);
    }
  }

  private callDataService(action: eaType) {
    const service = this.dataService.getService(action.entityName);
    switch (action.op) {
      case EntityOp.GET_ALL: {
        return service.getAll(action.payload);
      }
      case EntityOp.GET_BY_ID: {
        return service.getById(action.payload);
      }
      case EntityOp.ADD: {
        return service.add(action.payload);
      }
      case EntityOp._DELETE: {
        return service.delete(action.payload.id);
      }
      case EntityOp.UPDATE: {
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
