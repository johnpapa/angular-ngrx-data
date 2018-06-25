/** TODO: much more testing */
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Action, StoreModule, Store } from '@ngrx/store';
import { Actions, EffectsModule } from '@ngrx/effects';

import { Observable, of, ReplaySubject, throwError, timer } from 'rxjs';
import { delay, filter, first, mergeMap, skip, withLatestFrom } from 'rxjs/operators';

import { DataServiceError, EntityActionDataServiceError } from '../dataservices/data-service-error';
import { EntityAction } from '../actions/entity-action';
import { EntityActionFactory } from '../actions/entity-action-factory';
import { EntityOp, makeErrorOp } from '../actions/entity-op';
import { EntityCache } from '../reducers/entity-cache';
import { EntityCacheQuerySet, MergeQuerySet } from '../actions/entity-cache-action';
import { EntityCacheReducerFactory } from '../reducers/entity-cache-reducer-factory';
import { EntityCollection } from '../reducers/entity-collection';
import { EntityCollectionService } from './entity-collection-service';
import { EntityCollectionDataService, EntityDataService } from '../dataservices/entity-data.service';
import { EntityDispatcherFactory } from '../dispatchers/entity-dispatcher-factory';
import { EntityMetadataMap } from '../entity-metadata/entity-metadata';
import { EntityServices } from './entity-services';
import { NgrxDataModule } from '../ngrx-data.module';
import { HttpMethods } from '../dataservices/interfaces';
import { Logger } from '../utils/interfaces';

import { commandDispatchTest } from '../dispatchers/entity-dispatcher.spec';

describe('EntityServices', () => {
  describe('entityCache$', () => {
    it('should observe the entire entity cache', () => {
      const entityCacheValues: any = [];

      const { entityActionFactory, entityServices, store } = entityServicesSetup();

      // entityCache$.subscribe() callback invoked immediately. The cache is empty at first.
      entityServices.entityCache$.subscribe(ec => entityCacheValues.push(ec));

      // This first action to go through the Hero's EntityCollectionReducer
      // creates the collection in the EntityCache as a side-effect,
      // triggering the second entityCache$.subscribe() callback
      const heroAction = entityActionFactory.create('Hero', EntityOp.SET_FILTER, 'test');
      store.dispatch(heroAction);

      expect(entityCacheValues.length).toEqual(2, 'entityCache$ callback twice');
      expect(entityCacheValues[0]).toEqual({}, 'empty at first');
      expect(entityCacheValues[1].Hero).toBeDefined('has Hero collection');
    });
  });

  describe('dispatch(MergeQuerySet)', () => {
    // using async test to guard against false test pass.
    it('should update entityCache$ twice after merging two individual collections', (done: DoneFn) => {
      const hero1 = { id: 1, name: 'A' } as Hero;
      const hero2 = { id: 2, name: 'B' } as Hero;
      const heroes = [hero1, hero2];

      const villain = { key: 'DE', name: 'Dr. Evil' } as Villain;

      const { entityServices, heroCollectionService } = entityServicesSetup();
      const villainCollectionService = entityServices.getEntityCollectionService<Villain>('Villain');

      const entityCacheValues: any = [];
      entityServices.entityCache$.subscribe(cache => {
        entityCacheValues.push(cache);
        if (entityCacheValues.length === 3) {
          expect(entityCacheValues[0]).toEqual({}, '#1 empty at first');
          expect(entityCacheValues[1]['Hero'].ids).toEqual([1, 2], '#2 has heroes');
          expect(entityCacheValues[1]['Villain']).toBeUndefined('#2 does not have Villain collection');
          expect(entityCacheValues[2]['Villain'].entities['DE']).toEqual(villain, '#3 has villain');
          done();
        }
      });

      heroCollectionService.createAndDispatch(EntityOp.ADD_MANY, heroes);
      villainCollectionService.createAndDispatch(EntityOp.ADD_ONE, villain);
    });

    // using async test to guard against false test pass.
    it('should update entityCache$ once after merging multiple collections', (done: DoneFn) => {
      const hero1 = { id: 1, name: 'A' } as Hero;
      const hero2 = { id: 2, name: 'B' } as Hero;
      const heroes = [hero1, hero2];
      const villain = { key: 'DE', name: 'Dr. Evil' } as Villain;
      const querySet: EntityCacheQuerySet = {
        Hero: heroes,
        Villain: [villain]
      };
      const action = new MergeQuerySet(querySet);

      const { entityServices } = entityServicesSetup();

      // Skip initial value. Want the first one after merge is dispatched
      entityServices.entityCache$.pipe(skip(1), first()).subscribe(cache => {
        expect(cache['Hero'].ids).toEqual([1, 2], 'has merged heroes');
        expect(cache['Villain'].entities['DE']).toEqual(villain, 'has merged villain');
        done();
      });
      entityServices.dispatch(action);
    });
  });

  describe('EntityCollectionService', () => {
    describe('Command dispatching', () => {
      // Borrowing the dispatcher tests from entity-dispatcher.spec.
      // The critical difference: those test didn't invoke the reducers; they do when run here.
      commandDispatchTest(getDispatcher);

      function getDispatcher() {
        const { heroCollectionService, store } = entityServicesSetup();
        const dispatcher = heroCollectionService.dispatcher;
        return { dispatcher, store };
      }
    });

    describe('queries', () => {
      let heroCollectionService: EntityCollectionService<Hero>;
      let dataService: TestDataService;
      let reducedActions$Snoop: () => void;

      beforeEach(() => {
        ({ heroCollectionService, reducedActions$Snoop, dataService } = entityServicesSetup());
      });

      // Compare to next test which subscribes to getAll() result
      it('can use loading$ to learn when getAll() succeeds', (done: DoneFn) => {
        const hero1 = { id: 1, name: 'A' } as Hero;
        const hero2 = { id: 2, name: 'B' } as Hero;
        const heroes = [hero1, hero2];
        dataService.setResponse('getAll', heroes);
        heroCollectionService.getAll();

        // N.B.: This technique does not detect errors
        heroCollectionService.loading$
          .pipe(filter(loading => !loading), withLatestFrom(heroCollectionService.entities$))
          .subscribe(([loading, data]) => {
            expect(data).toEqual(heroes);
            done();
          });
      });

      // Compare to previous test the waits for loading$ flag to flip
      it('getAll observable should emit heroes on success', (done: DoneFn) => {
        const hero1 = { id: 1, name: 'A' } as Hero;
        const hero2 = { id: 2, name: 'B' } as Hero;
        const heroes = [hero1, hero2];
        dataService.setResponse('getAll', heroes);
        heroCollectionService.getAll().subscribe(expectDataToBe(heroes, done));

        // reducedActions$Snoop(); // diagnostic
      });

      it('getAll observable should emit expected error when data service fails', (done: DoneFn) => {
        const httpError = { error: new Error('Test Failure'), status: 501 };
        const error = makeDataServiceError('GET', httpError);
        dataService.setErrorResponse('getAll', error);
        heroCollectionService.getAll().subscribe(expectErrorToBe(error, done));
      });

      it('getByKey observable should emit a hero on success', (done: DoneFn) => {
        const hero = { id: 1, name: 'A' } as Hero;
        dataService.setResponse('getById', hero);
        heroCollectionService.getByKey(1).subscribe(expectDataToBe(hero, done));
      });

      it('getByKey observable should emit expected error when data service fails', (done: DoneFn) => {
        // Simulate HTTP 'Not Found' response
        const httpError = new HttpErrorResponse({
          error: 'Entity not found',
          status: 404,
          statusText: 'Not Found',
          url: 'bad/location'
        });

        // For test purposes, the following would have been effectively the same thing
        // const httpError = { error: new Error('Entity not found'), status: 404 };

        const error = makeDataServiceError('GET', httpError);
        dataService.setErrorResponse('getById', error);
        heroCollectionService.getByKey(42).subscribe(expectErrorToBe(error, done));
      });
    });

    describe('saves (optimistic)', () => {});

    describe('saves (pessimistic)', () => {});

    describe('selectors$', () => {
      let entityActionFactory: EntityActionFactory;
      let heroCollectionService: EntityCollectionService<Hero>;
      let store: Store<EntityCache>;

      function dispatchedAction() {
        return <EntityAction>(<jasmine.Spy>store.dispatch).calls.argsFor(0)[0];
      }

      beforeEach(() => {
        const setup = entityServicesSetup();
        ({ entityActionFactory, heroCollectionService, store } = setup);
        spyOn(store, 'dispatch').and.callThrough();
      });

      it('can get collection from collection$', () => {
        let collection: EntityCollection<Hero>;
        const action = entityActionFactory.create('Hero', EntityOp.ADD_ALL, [{ id: 1, name: 'A' }]);
        store.dispatch(action);
        heroCollectionService.collection$.subscribe(c => {
          collection = c;
        });

        expect(collection.ids).toEqual([1]);
      });
    });
  });
});

// region test helpers
class Hero {
  id: number;
  name: string;
  saying?: string;
}
class Villain {
  key: string;
  name: string;
}

const entityMetadata: EntityMetadataMap = {
  Hero: {},
  Villain: { selectId: (villain: Villain) => villain.key }
};

function entityServicesSetup() {
  const logger = jasmine.createSpyObj('Logger', ['error', 'log', 'warn']);

  TestBed.configureTestingModule({
    imports: [
      StoreModule.forRoot({}),
      EffectsModule.forRoot([]),
      NgrxDataModule.forRoot({
        entityMetadata: entityMetadata
      })
    ],
    /* tslint:disable-next-line:no-use-before-declare */
    providers: [{ provide: EntityDataService, useClass: TestDataService }, { provide: Logger, useValue: logger }]
  });

  const actions$: Observable<Action> = TestBed.get(Actions);
  const entityActionFactory: EntityActionFactory = TestBed.get(EntityActionFactory);
  const entityServices: EntityServices = TestBed.get(EntityServices);
  const heroCollectionService = entityServices.getEntityCollectionService<Hero>('Hero');
  const entityDispatcherFactory: EntityDispatcherFactory = TestBed.get(EntityDispatcherFactory);
  const reducedActions$: Observable<Action> = entityDispatcherFactory.reducedActions$;
  const store: Store<EntityCache> = TestBed.get(Store);
  const dataService: TestDataService = TestBed.get(EntityDataService);

  /** Snoop on reducedActions$ while debugging a test */
  function reducedActions$Snoop() {
    reducedActions$.subscribe(act => {
      console.log('scannedActions$', act);
    });
  }

  return {
    actions$,
    entityActionFactory,
    entityServices,
    heroCollectionService,
    reducedActions$,
    reducedActions$Snoop,
    store,
    dataService
  };
}

function expectDataToBe(expected: any, done: DoneFn, message?: string) {
  return {
    next: (data: any) => {
      expect(data).toEqual(expected, message);
      done();
    },
    error: fail
  };
}

function expectErrorToBe(expected: any, done: DoneFn, message?: string) {
  return {
    next: (data: any) => {
      fail(`Expected error response but got data: '${JSON.stringify(data)}'`);
      done();
    },
    error: (error: any) => {
      expect(error).toEqual(expected, message);
      done();
    }
  };
}

/** make error produced by the EntityDataService */
function makeDataServiceError(
  /** Http method for that action */
  method: HttpMethods,
  /** Http error from the web api */
  httpError?: any,
  /** Options sent with the request */
  options?: any
) {
  let url = 'api/heroes';
  if (httpError) {
    url = httpError.url || url;
  } else {
    httpError = { error: new Error('Test error'), status: 500, url };
  }
  return new DataServiceError(httpError, { method, url, options });
}

export interface TestDataServiceMethod {
  add: jasmine.Spy;
  delete: jasmine.Spy;
  getAll: jasmine.Spy;
  getById: jasmine.Spy;
  getWithQuery: jasmine.Spy;
  update: jasmine.Spy;
}

export class TestDataService {
  add = jasmine.createSpy('add');
  delete = jasmine.createSpy('delete');
  getAll = jasmine.createSpy('getAll');
  getById = jasmine.createSpy('getById');
  getWithQuery = jasmine.createSpy('getWithQuery');
  update = jasmine.createSpy('update');

  getService(): TestDataServiceMethod {
    return this;
  }

  setResponse(methodName: keyof TestDataServiceMethod, data: any) {
    this[methodName].and.returnValue(of(data).pipe(delay(1)));
  }

  setErrorResponse(methodName: keyof TestDataServiceMethod, error: any) {
    // Following won't quite work because delay does not appear to delay an error
    // this[methodName].and.returnValue(throwError(error).pipe(delay(1)));
    // Use timer instead
    this[methodName].and.returnValue(timer(1).pipe(mergeMap(() => throwError(error))));
  }
}
// endregion test helpers
