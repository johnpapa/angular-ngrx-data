/** TODO: much more testing */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';

import { EntityAction, EntityActionFactory, EntityOp } from './entity.actions';
import { EntityCache } from './interfaces';
import { EntityCollection } from './entity-definition';
import { ENTITY_METADATA_TOKEN } from './interfaces';
import { EntityService, EntityServiceFactory } from './entity.service';

import { _NgrxDataModuleWithoutEffects } from './ngrx-data.module'

import { commandDispatchTest } from './entity-dispatcher.spec';

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

  });
});

// region test helpers
const heroMetadata = {
  entityName: 'Hero'
}

function entityServiceFactorySetup() {

  TestBed.configureTestingModule({
    imports: [
      StoreModule.forRoot({}),
      _NgrxDataModuleWithoutEffects
    ],
    providers: [
      { provide: ENTITY_METADATA_TOKEN, multi: true, useValue: {
        Hero: heroMetadata
      }},
    ]
  });

  const testStore: Store<EntityCache> = TestBed.get(Store);
  spyOn(testStore, 'dispatch').and.callThrough();

  const entityActionFactory: EntityActionFactory = TestBed.get(EntityActionFactory);
  const entityServiceFactory: EntityServiceFactory = TestBed.get(EntityServiceFactory);

  return { entityActionFactory, entityServiceFactory, testStore };
}

function heroDispatcherSetup() {
  const { entityServiceFactory, testStore } = entityServiceFactorySetup();
  const dispatcher: EntityService<Hero> = entityServiceFactory.create<Hero>('Hero');
  return { dispatcher, testStore };
}
// endregion test helpers
