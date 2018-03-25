import { Injectable } from '@angular/core';
import { Action, Store, StoreModule } from '@ngrx/store';
import { Actions, Effect, EffectsModule } from '@ngrx/effects';

// Not using marble testing
import { TestBed } from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { concatMap, map, skip } from 'rxjs/operators';

import {
  EntityAction,
  EntityActionFactory,
  EntityActions,
  EntityOp,
  OP_ERROR
} from './actions';
import { EntityCache } from './reducers/entity-cache';
import { EntityEffects, persistOps } from './effects/entity-effects';
import { NgrxDataModule } from './ngrx-data.module';

export class TestEntityActions extends EntityActions {
  set stream(source: Observable<any>) {
    this.source = source;
  }
}

// For AOT
export function getActions() {
  return new TestEntityActions();
}

@Injectable()
export class TestEntityEffects {
  @Effect()
  test$: Observable<Action> = this.actions$
    .ofOp(persistOps)
    .pipe(map(this.testHook));

  testHook(action: EntityAction) {
    return {
      type: 'test-action',
      payload: action, // the incoming action
      entityName: action.entityName
    };
  }

  constructor(private actions$: EntityActions) {}
}

export class Hero {
  id: number;
  name: string;
}

const entityMetadata = {
  Hero: {}
};

//////// Tests begin ////////

describe('NgrxDataModule', () => {
  describe('(replace EntityEffects)', () => {
    // factory never changes in these tests
    const entityActionFactory = new EntityActionFactory();

    let actions$: Actions;
    let entityAction$: TestEntityActions;
    let store: Store<EntityCache>;
    let testEffects: TestEntityEffects;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot({}),
          EffectsModule.forRoot([]),
          NgrxDataModule.forRoot({
            entityMetadata: entityMetadata
          })
        ],
        providers: [{ provide: EntityEffects, useClass: TestEntityEffects }]
      });

      actions$ = TestBed.get(Actions);
      entityAction$ = TestBed.get(EntityActions);
      store = TestBed.get(Store);

      testEffects = TestBed.get(EntityEffects);
      spyOn(testEffects, 'testHook').and.callThrough();
    });

    it('should invoke test effect with an EntityAction', () => {
      const action = entityActionFactory.create('Hero', EntityOp.QUERY_ALL);
      const actions: Action[] = [];

      // listen for actions after the next dispatched action
      actions$.pipe(skip(1)).subscribe(act => actions.push(act));

      store.dispatch(action);
      expect(actions.length).toBe(1, 'expect one effect action');
      expect(actions[0].type).toBe('test-action');
    });

    it('should not invoke test effect with non-EntityAction', () => {
      const actions: Action[] = [];

      // listen for actions after the next dispatched action
      actions$.pipe(skip(1)).subscribe(act => actions.push(act));

      store.dispatch({ type: 'dummy-action' });
      expect(actions.length).toBe(0);
    });
  });
});
