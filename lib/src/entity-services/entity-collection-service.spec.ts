/** TODO: much more testing */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Action, StoreModule, Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

import { Subject } from 'rxjs';

import { EntityAction, EntityActionFactory } from '../actions/entity-action';
import { EntityOp } from '../actions/entity-op';

import { EntityCache } from '../reducers/entity-cache';
import { EntityCollection } from '../reducers/entity-collection';
import { ENTITY_METADATA_TOKEN } from '../entity-metadata/entity-metadata';
import {
  EntityCollectionService,
  EntityCollectionServiceFactory
} from './entity-services-interfaces';

import { NgrxDataModuleWithoutEffects } from '../ngrx-data-without-effects.module';

import { commandDispatchTest } from '../dispatchers/entity-dispatcher.spec';

class Hero {
  id: number;
  name: string;
  saying?: string;
}

describe('EntityCollectionService', () => {
  describe('Commands', () => {
    commandDispatchTest(heroDispatcherSetup);
  });

  describe('Selectors$', () => {
    let entityCollectionServiceFactory: EntityCollectionServiceFactory;
    let heroService: EntityCollectionService<Hero>;
    let store: Store<EntityCache>;
    let createAction: (
      entityName: string,
      op: EntityOp,
      payload: any
    ) => EntityAction;

    function dispatchedAction() {
      return <EntityAction>(<jasmine.Spy>store.dispatch).calls.argsFor(0)[0];
    }

    beforeEach(() => {
      // Note: bug in linter is responsible for this tortured syntax.
      const factorySetup = entityServiceFactorySetup();
      const { entityActionFactory, testStore } = factorySetup;
      entityCollectionServiceFactory =
        factorySetup.entityCollectionServiceFactory;
      heroService = entityCollectionServiceFactory.create<Hero>('Hero');
      store = testStore;
      createAction = entityActionFactory.create.bind(entityActionFactory);
    });

    it('can get collection from collection$', () => {
      let collection: EntityCollection<Hero>;
      const action = createAction('Hero', EntityOp.ADD_ALL, [
        { id: 1, name: 'A' }
      ]);
      store.dispatch(action);
      heroService.collection$.subscribe(c => {
        collection = c;
      });

      expect(collection.ids).toEqual([1]);
    });

    it('`EntityCollectionServiceFactory.entityCache$` observes the entire entity cache', () => {
      const entityCacheValues: any = [];

      entityCollectionServiceFactory.entityCache$.subscribe(ec =>
        entityCacheValues.push(ec)
      );

      // An action that goes through the Hero's EntityCollectionReducer
      // creates the collection in the store as a side-effect
      const heroAction = createAction('Hero', EntityOp.SET_FILTER, 'test');
      store.dispatch(heroAction);

      expect(entityCacheValues.length).toEqual(2, 'set the cache twice');
      expect(entityCacheValues[0]).toEqual({}, 'empty at first');
      expect(entityCacheValues[1].Hero).toBeDefined('has Hero collection');
    });
  });
});

// region test helpers
const heroMetadata = {
  entityName: 'Hero'
};

function entityServiceFactorySetup() {
  const actions$ = new Subject<Action>();

  TestBed.configureTestingModule({
    imports: [StoreModule.forRoot({}), NgrxDataModuleWithoutEffects],
    providers: [
      { provide: Actions, useValue: actions$ },
      {
        provide: ENTITY_METADATA_TOKEN,
        multi: true,
        useValue: {
          Hero: heroMetadata
        }
      }
    ]
  });

  const testStore: Store<EntityCache> = TestBed.get(Store);
  spyOn(testStore, 'dispatch').and.callThrough();

  const entityActionFactory: EntityActionFactory = TestBed.get(
    EntityActionFactory
  );
  const entityCollectionServiceFactory: EntityCollectionServiceFactory = TestBed.get(
    EntityCollectionServiceFactory
  );

  return {
    actions$,
    entityActionFactory,
    entityCollectionServiceFactory,
    testStore
  };
}

function heroDispatcherSetup() {
  const {
    entityCollectionServiceFactory,
    testStore
  } = entityServiceFactorySetup();
  const dispatcher: EntityCollectionService<
    Hero
  > = entityCollectionServiceFactory.create<Hero>('Hero');
  return { dispatcher, testStore };
}
// endregion test helpers
