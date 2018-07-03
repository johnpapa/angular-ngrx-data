import { Injectable } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Action, StoreModule, Store } from '@ngrx/store';
import { Actions, EffectsModule } from '@ngrx/effects';

import { Observable, of, ReplaySubject, throwError, timer } from 'rxjs';
import { delay, filter, first, mergeMap, skip, tap, withLatestFrom } from 'rxjs/operators';

import { DataServiceError, EntityActionDataServiceError } from '../dataservices/data-service-error';
import { EntityAction, EntityActionOptions } from '../actions/entity-action';
import { EntityActionFactory } from '../actions/entity-action-factory';
import { EntityOp, makeErrorOp, OP_SUCCESS } from '../actions/entity-op';
import { EntityCache } from '../reducers/entity-cache';
import { EntityCacheQuerySet, MergeQuerySet } from '../actions/entity-cache-action';
import { EntityCacheReducerFactory } from '../reducers/entity-cache-reducer-factory';
import { EntityCollection } from '../reducers/entity-collection';
import { EntityCollectionDataService } from '../dataservices/interfaces';
import { EntityCollectionService } from './entity-collection-service';
import { EntityDataService } from '../dataservices/entity-data.service';
import { EntityDispatcherDefaultOptions } from '../dispatchers/entity-dispatcher-default-options';
import { EntityDispatcherFactory } from '../dispatchers/entity-dispatcher-factory';
import { EntityMetadataMap } from '../entity-metadata/entity-metadata';
import { EntityServices } from './entity-services';
import { NgrxDataModule } from '../ngrx-data.module';
import { HttpMethods } from '../dataservices/interfaces';
import { Logger } from '../utils/interfaces';
import { PersistanceCanceled } from '../dispatchers/entity-dispatcher';

import { commandDispatchTest } from '../dispatchers/entity-dispatcher.spec';

describe('EntityServices', () => {
  describe('entityActionErrors$', () => {
    it('should emit EntityAction errors for multiple entity types', () => {
      const errors: EntityAction[] = [];
      const { entityActionFactory, entityServices } = entityServicesSetup();
      entityServices.entityActionErrors$.subscribe(error => errors.push(error));

      entityServices.dispatch({ type: 'not-an-entity-action' });
      entityServices.dispatch(entityActionFactory.create('Hero', EntityOp.QUERY_ALL)); // not an error
      entityServices.dispatch(
        entityActionFactory.create('Hero', EntityOp.QUERY_ALL_ERROR, makeDataServiceError('GET', new Error('Bad hero news')))
      );
      entityServices.dispatch(entityActionFactory.create('Villain', EntityOp.QUERY_ALL)); // not an error
      entityServices.dispatch(
        entityActionFactory.create('Villain', EntityOp.SAVE_ADD_ONE_ERROR, makeDataServiceError('PUT', new Error('Bad villain news')))
      );

      expect(errors.length).toBe(2);
    });
  });

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

      const { entityServices } = entityServicesSetup();
      const heroCollectionService = entityServices.getEntityCollectionService<Hero>('Hero');
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

      // Emulate what would happen if had queried collections separately
      heroCollectionService.createAndDispatch(EntityOp.QUERY_MANY_SUCCESS, heroes);
      villainCollectionService.createAndDispatch(EntityOp.QUERY_BY_KEY_SUCCESS, villain);
    });

    // using async test to guard against false test pass.
    it('should update entityCache$ once when MergeQuerySet multiple collections', (done: DoneFn) => {
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
});

// #region test helpers
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
    providers: [{ provide: EntityDataService, useValue: null }, { provide: Logger, useValue: logger }]
  });

  const actions$: Observable<Action> = TestBed.get(Actions);
  const entityActionFactory: EntityActionFactory = TestBed.get(EntityActionFactory);
  const entityDispatcherFactory: EntityDispatcherFactory = TestBed.get(EntityDispatcherFactory);
  const entityServices: EntityServices = TestBed.get(EntityServices);
  const store: Store<EntityCache> = TestBed.get(Store);

  return {
    actions$,
    entityActionFactory,
    entityServices,
    store
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
// #endregion test helpers
