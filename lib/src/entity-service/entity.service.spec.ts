/** TODO: much more testing */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Action, StoreModule, Store } from '@ngrx/store';

import { Subject } from 'rxjs/Subject';

import { EntityAction, EntityActions, EntityActionFactory, EntityOp } from '../actions';
import { EntityCache, EntityCollection } from '../reducers';
import { ENTITY_METADATA_TOKEN } from '../entity-metadata/entity-metadata';
import { EntityService, EntityServiceFactory } from './entity.service';

import { _NgrxDataModuleWithoutEffects } from '../ngrx-data.module'

import { commandDispatchTest } from '../dispatchers/entity-dispatcher.spec';

class Hero {
  id: number;
  name: string;
  saying?: string;
}

describe('EntityService', () => {
  describe('Commands', () => {
    commandDispatchTest(heroDispatcherSetup);
  })

  describe('Selectors$', () => {

    let heroService: EntityService<Hero>;
    let store: Store<EntityCache>;
    let createAction:
      (entityName: string, op: EntityOp, payload: any) => EntityAction;

    function dispatchedAction() {
      return <EntityAction> (<jasmine.Spy> store.dispatch).calls.argsFor(0)[0];
    }

    beforeEach(() => {
      const { entityActionFactory, entityServiceFactory, testStore } = entityServiceFactorySetup();
      heroService = entityServiceFactory.create<Hero>('Hero');
      store = testStore;
      createAction = entityActionFactory.create.bind(entityActionFactory);
    });

    it('can get collection from collection$', () => {
      let collection: EntityCollection<Hero>;
      const action = createAction('Hero', EntityOp.ADD_ALL, [
        { id: 1, name: 'A'}
      ])
      store.dispatch(action);
      heroService.collection$.subscribe(c => {
        collection = c
      });

      expect(collection.ids).toEqual([1]);
    });

    it('`entityCache$` observes the entire entity cache', () => {
      const entityCacheValues: any = [];
      const entityServiceFactory: EntityServiceFactory = TestBed.get(EntityServiceFactory);

      entityServiceFactory.entityCache$.subscribe(ec => entityCacheValues.push(ec));

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
}

function entityServiceFactorySetup() {
  const actions$ = new Subject<Action>();
  const entityActions = new EntityActions(<any> actions$);

  TestBed.configureTestingModule({
    imports: [
      StoreModule.forRoot({}),
      _NgrxDataModuleWithoutEffects
    ],
    providers: [
      { provide: EntityActions, useValue: entityActions },
      { provide: ENTITY_METADATA_TOKEN, multi: true, useValue: {
        Hero: heroMetadata
      }},
    ]
  });

  const testStore: Store<EntityCache> = TestBed.get(Store);
  spyOn(testStore, 'dispatch').and.callThrough();

  const entityActionFactory: EntityActionFactory = TestBed.get(EntityActionFactory);
  const entityServiceFactory: EntityServiceFactory = TestBed.get(EntityServiceFactory);

  return { actions$, entityActions, entityActionFactory, entityServiceFactory, testStore };
}

function heroDispatcherSetup() {
  const { entityServiceFactory, testStore } = entityServiceFactorySetup();
  const dispatcher: EntityService<Hero> = entityServiceFactory.create<Hero>('Hero');
  return { dispatcher, testStore };
}
// endregion test helpers
