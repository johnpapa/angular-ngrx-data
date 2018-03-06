// Not using marble testing
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs/observable/of';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Observable } from 'rxjs/Observable';
import { delay, first, merge } from 'rxjs/operators';

import {
  EntityAction, EntityActionFactory, EntityActions, EntityOp, OP_ERROR
} from '../actions';

import {
  DataServiceError,
  EntityCollectionDataService,
  EntityDataService,
  EntityActionDataServiceError,
  HttpMethods,
  PersistenceResultHandler, DefaultPersistenceResultHandler
} from '../dataservices';

import { EntityEffects } from './entity-effects';

import { Update } from '../utils';

export class TestEntityActions extends EntityActions {
  set stream(source: Observable<any>) {
    this.source = source;
  }
}

// For AOT
export function getActions() {
  return new TestEntityActions();
}

export class TestEntityDataService {
  dataServiceSpy: any;

  constructor() {
    this.dataServiceSpy = jasmine.createSpyObj('EntityCollectionDataService<Hero>',
    ['add', 'delete', 'getAll', 'getById', 'getWithQuery', 'update']);
  }

  getService() {
    return this.dataServiceSpy;
  }
}

// For AOT
export function getDataService() {
  return new TestEntityDataService();
}

export class Hero {
  id: number;
  name: string;
}

//////// Tests begin ////////

describe('EntityEffects (normal testing)', () => {
  // factory never changes in these tests
  const entityActionFactory = new EntityActionFactory();

  let effects: EntityEffects;
  let testEntityDataService: TestEntityDataService;
  let actions$: TestEntityActions;

  function expectCompletion(completion: EntityAction) {
    effects.persist$.subscribe(
      result => {
        expect(result).toEqual(completion)
      },
      e => {
        fail(e);
      }
    )
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EntityEffects,
        { provide: EntityActions, useFactory: getActions },
        { provide: EntityActionFactory, useValue: entityActionFactory},
        { provide: EntityDataService, useFactory: getDataService },
        { provide: PersistenceResultHandler, useClass: DefaultPersistenceResultHandler }
      ],
    });

    effects = TestBed.get(EntityEffects);
    testEntityDataService = TestBed.get(EntityDataService);
    actions$ = TestBed.get(EntityActions);
  });

  it('should return a QUERY_ALL_SUCCESS, with the heroes, on success', () => {
    const hero1 = { id: 1, name: 'A' } as Hero;
    const hero2 = { id: 2, name: 'B' } as Hero;
    const heroes = [hero1, hero2];

    const action = entityActionFactory.create('Hero', EntityOp.QUERY_ALL)
    const completion = entityActionFactory.create('Hero', EntityOp.QUERY_ALL_SUCCESS, heroes);

    actions$.stream = of(action);
    const response = of(heroes);
    testEntityDataService.dataServiceSpy.getAll.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a QUERY_ALL_ERROR when service fails', () => {
    const action = entityActionFactory.create('Hero', EntityOp.QUERY_ALL);
    const httpError = { error: new Error('Test Failure'), status: 501 };
    const completion = makeEntityErrorCompletion(action, 'GET', httpError)
    const error = completion.payload.error;

    actions$.stream = of(action);
    const response = new ErrorObservable(error);
    testEntityDataService.dataServiceSpy.getAll.and.returnValue(response);

    expectCompletion(completion);
    expect(completion.op).toEqual(EntityOp.QUERY_ALL_ERROR);
  });

  it('should return a QUERY_BY_KEY_SUCCESS with a hero on success', () => {
    const action = entityActionFactory.create('Hero', EntityOp.QUERY_BY_KEY, 42);
    const completion = entityActionFactory.create('Hero', EntityOp.QUERY_BY_KEY_SUCCESS);

    actions$.stream = of(action);
    const response = of(undefined);
    testEntityDataService.dataServiceSpy.getById.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a QUERY_BY_KEY_ERROR when service fails', () => {
    const action = entityActionFactory.create('Hero', EntityOp.QUERY_BY_KEY, 42);
    const httpError = { error: new Error('Entity not found'), status: 404 };
    const completion = makeEntityErrorCompletion(action, 'DELETE', httpError)
    const error = completion.payload.error;

    actions$.stream = of(action);
    const response = new ErrorObservable(error);
    testEntityDataService.dataServiceSpy.getById.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a QUERY_MANY_SUCCESS with selected heroes on success', () => {
    const hero1 = { id: 1, name: 'BA' } as Hero;
    const hero2 = { id: 2, name: 'BB' } as Hero;
    const heroes = [hero1, hero2];

    const action = entityActionFactory.create('Hero', EntityOp.QUERY_MANY, {name: 'B'});
    const completion = entityActionFactory.create('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);

    actions$.stream = of(action);
    const response = of(heroes);
    testEntityDataService.dataServiceSpy.getWithQuery.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a QUERY_MANY_ERROR when service fails', () => {
    const action = entityActionFactory.create('Hero', EntityOp.QUERY_MANY, {name: 'B'});
    const httpError = { error: new Error('Resource not found'), status: 404 };
    const completion = makeEntityErrorCompletion(action, 'GET', httpError, {name: 'B'})
    const error = completion.payload.error;

    actions$.stream = of(action);
    const response = new ErrorObservable(error);
    testEntityDataService.dataServiceSpy.getWithQuery.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a SAVE_ADD_SUCCESS with the hero on success', () => {
    const hero = { id: 1, name: 'A' } as Hero;

    const action = entityActionFactory.create('Hero', EntityOp.SAVE_ADD_ONE, hero);
    const completion = entityActionFactory.create('Hero', EntityOp.SAVE_ADD_ONE_SUCCESS, hero);

    actions$.stream = of(action);
    const response = of(hero);
    testEntityDataService.dataServiceSpy.add.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a SAVE_ADD_ERROR when service fails', () => {
    const hero = { id: 1, name: 'A' } as Hero;
    const action = entityActionFactory.create('Hero', EntityOp.SAVE_ADD_ONE, hero);
    const httpError = { error: new Error('Test Failure'), status: 501 };
    const completion = makeEntityErrorCompletion(action, 'PUT', httpError)
    const error = completion.payload.error;

    actions$.stream = of(action);
    const response = new ErrorObservable(error);
    testEntityDataService.dataServiceSpy.add.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a SAVE_DELETE_SUCCESS on success', () => {
    const action = entityActionFactory.create('Hero', EntityOp.SAVE_DELETE_ONE, 42);
    const completion = entityActionFactory.create('Hero', EntityOp.SAVE_DELETE_ONE_SUCCESS);

    actions$.stream = of(action);
    const response = of(undefined);
    testEntityDataService.dataServiceSpy.delete.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a SAVE_DELETE_ERROR when service fails', () => {
    const action = entityActionFactory.create('Hero', EntityOp.SAVE_DELETE_ONE, 42);
    const httpError = { error: new Error('Test Failure'), status: 501 };
    const completion = makeEntityErrorCompletion(action, 'DELETE', httpError)
    const error = completion.payload.error;

    actions$.stream = of(action);
    const response = new ErrorObservable(error);
    testEntityDataService.dataServiceSpy.delete.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a SAVE_UPDATE_SUCCESS with the hero on success', () => {
    const update = { id: 1, changes: {id: 1, name: 'A' }} as Update<Hero>;

    const action = entityActionFactory.create('Hero', EntityOp.SAVE_UPDATE_ONE, update);
    const completion = entityActionFactory.create('Hero', EntityOp.SAVE_UPDATE_ONE_SUCCESS, update);

    actions$.stream = of(action);
    const response = of(update);
    testEntityDataService.dataServiceSpy.update.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a SAVE_UPDATE_ERROR when service fails', () => {
    const update = { id: 1, changes: {id: 1, name: 'A' }} as Update<Hero>;
    const action = entityActionFactory.create('Hero', EntityOp.SAVE_UPDATE_ONE, update);
    const httpError = { error: new Error('Test Failure'), status: 501 };
    const completion = makeEntityErrorCompletion(action, 'PUT', httpError)
    const error = completion.payload.error;

    actions$.stream = of(action);
    const response = new ErrorObservable(error);
    testEntityDataService.dataServiceSpy.update.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a SAVE_ADD_ONE_OPTIMISTIC_SUCCESS with the hero on success', () => {
    const hero = { id: 1, name: 'A' } as Hero;

    const action = entityActionFactory.create('Hero', EntityOp.SAVE_ADD_ONE_OPTIMISTIC, hero);
    const completion = entityActionFactory.create('Hero', EntityOp.SAVE_ADD_ONE_OPTIMISTIC_SUCCESS, hero);

    actions$.stream = of(action);
    const response = of(hero);
    testEntityDataService.dataServiceSpy.add.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a SAVE_ADD_ONE_OPTIMISTIC_ERROR when service fails', () => {
    const hero = { id: 1, name: 'A' } as Hero;
    const action = entityActionFactory.create('Hero', EntityOp.SAVE_ADD_ONE_OPTIMISTIC, hero);
    const httpError = { error: new Error('Test Failure'), status: 501 };
    const completion = makeEntityErrorCompletion(action, 'PUT', httpError)
    const error = completion.payload.error;

    actions$.stream = of(action);
    const response = new ErrorObservable(error);
    testEntityDataService.dataServiceSpy.add.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a SAVE_DELETE_ONE_OPTIMISTIC_SUCCESS on success', () => {
    const action = entityActionFactory.create('Hero', EntityOp.SAVE_DELETE_ONE_OPTIMISTIC, 42);
    const completion = entityActionFactory.create('Hero', EntityOp.SAVE_DELETE_ONE_OPTIMISTIC_SUCCESS);

    actions$.stream = of(action);
    const response = of(undefined);
    testEntityDataService.dataServiceSpy.delete.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a SAVE_DELETE_ONE_OPTIMISTIC_ERROR when service fails', () => {
    const action = entityActionFactory.create('Hero', EntityOp.SAVE_DELETE_ONE_OPTIMISTIC, 42);
    const httpError = { error: new Error('Test Failure'), status: 501 };
    const completion = makeEntityErrorCompletion(action, 'DELETE', httpError)
    const error = completion.payload.error;

    actions$.stream = of(action);
    const response = new ErrorObservable(error);
    testEntityDataService.dataServiceSpy.delete.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a SAVE_UPDATE_ONE_OPTIMISTIC_SUCCESS with the hero on success', () => {
    const update = { id: 1, changes: {id: 1, name: 'A' }} as Update<Hero>;

    const action = entityActionFactory.create('Hero', EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC, update);
    const completion = entityActionFactory.create('Hero', EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_SUCCESS, update);

    actions$.stream = of(action);
    const response = of(update);
    testEntityDataService.dataServiceSpy.update.and.returnValue(response);

    expectCompletion(completion);
  });

  it('should return a SAVE_UPDATE_ONE_OPTIMISTIC_ERROR when service fails', () => {
    const update = { id: 1, changes: {id: 1, name: 'A' }} as Update<Hero>;
    const action = entityActionFactory.create('Hero', EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC, update);
    const httpError = { error: new Error('Test Failure'), status: 501 };
    const completion = makeEntityErrorCompletion(action, 'PUT', httpError)
    const error = completion.payload.error;

    actions$.stream = of(action);
    const response = new ErrorObservable(error);
    testEntityDataService.dataServiceSpy.update.and.returnValue(response);

    expectCompletion(completion);
  });

  it(`should not do anything with an irrelevant action`, (done: DoneFn) => {
    // Would clear the cached collection
    const action = entityActionFactory.create('Hero', EntityOp.REMOVE_ALL);

    actions$.stream = of(action);
    const sentinel = 'no persist$ effect';

    effects.persist$.pipe(
      merge(
        of(sentinel).pipe(delay(1)),
        // of(entityActionFactory.create('Hero', EntityOp.QUERY_ALL)) // will cause test to fail
      ),
      first()
    )
    .subscribe(
      result => expect(result).toEqual(sentinel),
      err => {
        fail(err);
        done();
      },
      done
    )
  });
});

/** Make an EntityDataService error */
function makeEntityErrorCompletion(
  /** The action that initiated the data service call */
  originalAction: EntityAction,
  /** Http method for that action */
  method: HttpMethods,
  /** Http error from the web api */
  httpError?: any,
  /** Options sent with the request */
  options?: any,
) {

  let url = 'api/heroes';

  // Error from the web api
  if (httpError) {
    url = httpError.url || url;
  } else {
    httpError = { error: new Error('Test error'), status: 500, url };
  }

  // Error produced by the EntityDataService
  const error = new DataServiceError(httpError, { method, url, options });

  const errOp = <EntityOp> (originalAction.op + OP_ERROR);

  // Entity Error Action
  const eaFactory = new EntityActionFactory();
  return eaFactory.create<EntityActionDataServiceError>('Hero', errOp, {originalAction, error});
}
