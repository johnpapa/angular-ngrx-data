/** TODO: much more testing */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Action, ScannedActionsSubject, StoreModule, Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

import { Subject } from 'rxjs';

import { EntityAction } from '../actions/entity-action';
import { EntityActionFactory } from '../actions/entity-action-factory';
import { EntityOp } from '../actions/entity-op';

import { EntityCache } from '../reducers/entity-cache';
import { EntityCollection } from '../reducers/entity-collection';
import { ENTITY_METADATA_TOKEN } from '../entity-metadata/entity-metadata';
import { EntityCollectionService, EntityCollectionServiceFactory } from './entity-services-interfaces';

import { NgrxDataModuleWithoutEffects } from '../ngrx-data-without-effects.module';

import { commandDispatchTest } from '../dispatchers/entity-dispatcher.spec';

class Hero {
  id: number;
  name: string;
  saying?: string;
}

describe('EntityCollectionService', () => {
  describe('Commands', () => {
    // Borrowing the dispatcher tests from entity-dispatcher.spec.
    // The critical difference: those test didn't invoke the reducers; they do when run here.
    commandDispatchTest(heroDispatcherSetup);
  });

  describe('Selectors$', () => {
    let entityCollectionServiceFactory: EntityCollectionServiceFactory;
    let heroService: EntityCollectionService<Hero>;
    let store: Store<EntityCache>;
    let entityActionFactory: EntityActionFactory;

    function dispatchedAction() {
      return <EntityAction>(<jasmine.Spy>store.dispatch).calls.argsFor(0)[0];
    }

    beforeEach(() => {
      const setup = entityServiceFactorySetup();
      entityActionFactory = setup.entityActionFactory;
      entityCollectionServiceFactory = setup.entityCollectionServiceFactory;
      heroService = entityCollectionServiceFactory.create<Hero>('Hero');
      store = setup.store;
      spyOn(store, 'dispatch').and.callThrough();
    });

    it('can get collection from collection$', () => {
      let collection: EntityCollection<Hero>;
      const action = entityActionFactory.create('Hero', EntityOp.ADD_ALL, [{ id: 1, name: 'A' }]);
      store.dispatch(action);
      heroService.collection$.subscribe(c => {
        collection = c;
      });

      expect(collection.ids).toEqual([1]);
    });

    it('`EntityCollectionServiceFactory.entityCache$` observes the entire entity cache', () => {
      const entityCacheValues: any = [];

      entityCollectionServiceFactory.entityCache$.subscribe(ec => entityCacheValues.push(ec));

      // An action that goes through the Hero's EntityCollectionReducer
      // creates the collection in the store as a side-effect
      const heroAction = entityActionFactory.create('Hero', EntityOp.SET_FILTER, 'test');
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

  const scannedActions$ = TestBed.get(ScannedActionsSubject);
  const store: Store<EntityCache> = TestBed.get(Store);

  const entityActionFactory: EntityActionFactory = TestBed.get(EntityActionFactory);
  const entityCollectionServiceFactory: EntityCollectionServiceFactory = TestBed.get(EntityCollectionServiceFactory);

  return {
    actions$,
    entityActionFactory,
    entityCollectionServiceFactory,
    scannedActions$,
    store
  };
}

function heroDispatcherSetup() {
  const { entityCollectionServiceFactory, store } = entityServiceFactorySetup();
  const heroService = entityCollectionServiceFactory.create<Hero>('Hero');
  const dispatcher = heroService.dispatcher;
  return { dispatcher, store };
}
// endregion test helpers
