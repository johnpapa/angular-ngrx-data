import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { concatMap, filter, first, mergeMap, tap } from 'rxjs/operators';

import * as EntityActions from './entity.actions';
import { EntityAction, EntityCache, EntityOp } from './interfaces';
import { EntitySelectors } from './entity.selectors';

type eaType = EntityAction<any, any>;

function isDeleteOp(action: eaType) {
  return action.op === EntityActions.DELETE || action.op === EntityActions.DELETE_BY_ID;
}

@Injectable()
export class EntityPrePersistEffects {
  @Effect()
  preDelete$ = this.actions$.pipe(filter(isDeleteOp), concatMap(action => this.preDelete(action)));

  private preDelete(action: eaType) {
    const selector = this.entitySelectors.getSelector(action.entityName);
    const entities$ = selector.entities$();

    switch (action.op) {
      case EntityActions.DELETE: {
        const entity = action.payload;
        return entities$.pipe(
          first(),
          mergeMap(entities => {
            const index = entities.findIndex(e => e === entity);
            const payload = { index, id: entity.id, entity };
            return createDeleteActions(action, payload);
          })
        );
      }

      case EntityActions.DELETE_BY_ID: {
        const id = action.payload;
        return entities$.pipe(
          first(),
          mergeMap(entities => {
            const index = entities.findIndex((e: any) => e.id === id);
            const payload = { index, id, entity: entities[index] };
            return createDeleteActions(action, payload);
          })
        );
      }
    }
  }

  constructor(private actions$: Actions, private entitySelectors: EntitySelectors) {}
}

function createDeleteActions(action: EntityAction<any, any>, payload: any) {
  const deleteAct = new EntityAction(action, EntityActions._DELETE, payload);
  return payload.index < 0
    ? [deleteAct]
    : [deleteAct, new EntityAction(action, EntityActions._DELETE_BY_INDEX, payload)];
}
