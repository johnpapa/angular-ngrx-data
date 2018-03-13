import { Action, ActionReducer, MetaReducer } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';

import { EntityAction, EntityActionFactory, EntityOp } from '../actions';
import { EntityCache } from './entity-cache';
import { EntityCacheMerge, EntityCacheSet } from '../actions/entity-cache-actions';
import { EntityCollection } from './entity-collection';
import { EntityCollectionCreator } from './entity-collection-creator';
import { EntityDefinitionService } from '../entity-metadata';
import { EntityMetadataMap } from '../entity-metadata';
import { Update } from '../utils';

import { EntityCollectionReducer, EntityCollectionReducerFactory } from './entity-collection.reducer';
import { EntityCollectionReducers, EntityReducerFactory } from './entity-reducer';

export class Bar { id: number; bar: string; }
export class Foo { id: string; foo: string; }
export class Hero { id: number; name: string; }
export class Villain { key: string; name: string; }

const metadata: EntityMetadataMap = {
  Hero: { },
  Villain: { selectId: (villain: Villain) => villain.key },
}

describe('EntityReducer', () => {
  // action factory never changes in these tests
  const entityActionFactory = new EntityActionFactory();
  const createAction:
    <P = any>(entityName: string, op: EntityOp, payload?: P) =>
      EntityAction = entityActionFactory.create.bind(entityActionFactory);

  let collectionCreator: EntityCollectionCreator;
  let collectionReducerFactory: EntityCollectionReducerFactory;
  let eds: EntityDefinitionService;
  let entityReducer: ActionReducer<EntityCache, EntityAction>;
  let entityReducerFactory: EntityReducerFactory;

  beforeEach(() => {
    eds = new EntityDefinitionService([metadata]);
    collectionCreator = new EntityCollectionCreator(eds);
    collectionReducerFactory = new EntityCollectionReducerFactory();

    entityReducerFactory = new EntityReducerFactory(
      eds, collectionCreator, collectionReducerFactory);
  });

  describe('#create', () => {
    beforeEach(() => {
      entityReducer = entityReducerFactory.create();
    });

    it('creates a default hero reducer when QUERY_ALL for hero', () => {
      const hero: Hero = { id: 42, name: 'Bobby'};
      const action = createAction<Hero>('Hero', EntityOp.ADD_ONE, hero);

      const state = entityReducer({}, action);
      const collection = state['Hero'];
      expect(collection.ids.length).toBe(1, 'should have added one');
      expect(collection.entities[42]).toEqual(hero, 'should be added hero');
    });

    it('throws when ask for reducer of unknown entity type', () => {
      const action = entityActionFactory.create('Foo', EntityOp.QUERY_ALL);
      expect(() => entityReducer({}, action)).toThrowError(/no EntityDefinition/i);
    });
  });

  describe('#registerReducer', () => {
    beforeEach(() => {
      entityReducer = entityReducerFactory.create();
    });

    it('can register a new reducer', () => {
      const reducer = createNoopReducer();
      entityReducerFactory.registerReducer('Foo', reducer);
      const action = entityActionFactory.create<Foo>(
        'Foo', EntityOp.ADD_ONE, {id: 'forty-two', foo: 'fooz'});
      // Must initialize the state by hand
      const state = entityReducer({}, action);
      const collection = state['Foo'];
      expect(collection.ids.length).toBe(0, 'ADD_ONE should do nothing');
    });

    it('can replace existing reducer by registering with same name', () => {
      // Just like ADD_ONE test above with default reducer
      // but this time should not add the hero.
      const hero: Hero = { id: 42, name: 'Bobby'};
      const reducer = createNoopReducer();
      entityReducerFactory.registerReducer('Hero', reducer);
      const action = entityActionFactory.create<Hero>('Hero', EntityOp.ADD_ONE, hero);
      const state = entityReducer({}, action);
      const collection = state['Hero'];
      expect(collection.ids.length).toBe(0, 'ADD_ONE should do nothing');
    });
  });

  /**
   * Test the EntityCache-level actions, SET and MERGE, which can
   * be used to restore the entity cache from a know state such as
   * re-hydrating from browser storage.
   * Useful for an offline-capable app.
   */
  describe('EntityCache-level actions', () => {
    const origState: EntityCache = {
      Hero: {
        ids: [42],
        entities: {42: { id: 42, name: 'Goodguy' } },
        filter: 'xxx',
        loaded: true,
        loading: false,
        originalValues: {}
      }
    };

    beforeEach(() => {
      entityReducer = entityReducerFactory.create();
    });

    it('can set the cache to a known state', () => {
      const heroes: Hero[] = [
        {id: 2, name: 'B'},
        {id: 1, name: 'A'},
      ];
      let action: any = createAction('Hero', EntityOp.QUERY_ALL_SUCCESS, heroes);
      let state = entityReducer(origState, action);
      expect(state).not.toEqual(origState, 'after QUERY_ALL_SUCCESS');

      action = new EntityCacheSet(origState);
      state = entityReducer(state, action);
      expect(state).toEqual(origState, 'after SET_ENTITY_CACHE');
    });

    it('can set merge an EntityCache into the one in the store', () => {
      //// Arrange: Dispatch changes to heroes and villains ////
      // Change the heroes
      const heroes: Hero[] = [
        {id: 2, name: 'B'},
        {id: 1, name: 'A'},
      ];
      let action: any = createAction('Hero', EntityOp.QUERY_ALL_SUCCESS, heroes);
      let state = entityReducer(origState, action);

      // change the villains
      const villains: Villain[] = [
        {key: '4', name: 'D'},
        {key: '3', name: 'C'},
      ];
      action = createAction('Villain', EntityOp.QUERY_ALL_SUCCESS, villains);
      state = entityReducer(state, action);

      ///// Act: "merge" the test cache of villains /////
      const cacheOfVillains = {
        Villain: {
          ids: [84],
          entities: {'84': { key: '84', name: 'Badguy' } },
          filter: '',
          loaded: true,
          loading: false,
          originalValues: {}
        }
      }
      action = new EntityCacheMerge(cacheOfVillains);
      state = entityReducer(state, action);

      //// Assert
      expect(state.Hero.ids).toEqual([2, 1], 'preserved heroes collection');
      expect(state.Villain).toEqual(cacheOfVillains.Villain, 'replaced villains from cacheOfVillains');
    });
  });

  describe('#registerReducers', () => {

    beforeEach(() => {
      entityReducer = entityReducerFactory.create();
    });

    it('can register several reducers at the same time.', () => {
      const reducer = createNoopReducer();
      const reducers: EntityCollectionReducers = {
        Foo: reducer,
        Bar: reducer
      }
      entityReducerFactory.registerReducers(reducers);

      const fooAction = entityActionFactory.create<Foo>(
        'Foo', EntityOp.ADD_ONE, {id: 'forty-two', foo: 'fooz'});
      const barAction = entityActionFactory.create<Bar>(
        'Bar', EntityOp.ADD_ONE, {id: 84, bar: 'baz'});

      let state = entityReducer({}, fooAction);
      state = entityReducer(state, barAction);

      expect(state['Foo'].ids.length).toBe(0, 'ADD_ONE Foo should do nothing');
      expect(state['Bar'].ids.length).toBe(0, 'ADD_ONE Bar should do nothing');
    });

    it('can register several reducers that may override.', () => {
      const reducer = createNoopReducer();
      const reducers: EntityCollectionReducers = {
        Foo: reducer,
        Hero: reducer
      }
      entityReducerFactory.registerReducers(reducers);

      const fooAction = entityActionFactory.create<Foo>(
        'Foo', EntityOp.ADD_ONE, {id: 'forty-two', foo: 'fooz'});
      const heroAction = entityActionFactory.create<Hero>(
        'Hero', EntityOp.ADD_ONE, {id: 84, name: 'Alex'});

      let state = entityReducer({}, fooAction);
      state = entityReducer(state, heroAction);

      expect(state['Foo'].ids.length).toBe(0, 'ADD_ONE Foo should do nothing');
      expect(state['Hero'].ids.length).toBe(0, 'ADD_ONE Hero should do nothing');
    });
  });

  describe('with EntityCollectionMetadataReducers', () => {

    let metaReducerA: MetaReducer<EntityCollection, EntityAction>;
    let metaReducerB: MetaReducer<EntityCollection, EntityAction>;
    let metaReducerOutput: any[];

    // Create MetaReducer that reports how it was called on the way in and out
    function testMetadataReducerFactory(name: string) {
      // Return the MetaReducer
      return (r: ActionReducer<EntityCollection, EntityAction>) => {
        // Return the wrapped reducer
        return (state: EntityCollection, action: EntityAction) => {
          // entered
          metaReducerOutput.push({ metaReducer: name, inOut: 'in', action });
          // called reducer
          const newState = r(state, action);
          // exited
          metaReducerOutput.push({ metaReducer: name, inOut: 'out', action });
          return newState;
        }
      };
    }

    let addOneAction: EntityAction<Hero>;
    let hero: Hero;

    beforeEach(() => {
      metaReducerOutput = [];
      metaReducerA = jasmine.createSpy('metaReducerA').and.callFake(testMetadataReducerFactory('A'));
      metaReducerB = jasmine.createSpy('metaReducerA').and.callFake(testMetadataReducerFactory('B'));
      const metaReducers = [ metaReducerA, metaReducerB ];

      entityReducerFactory = new EntityReducerFactory(
        eds, collectionCreator, collectionReducerFactory, metaReducers);

      entityReducer = entityReducerFactory.create();

      hero = { id: 42, name: 'Bobby'};
      addOneAction = entityActionFactory.create<Hero>('Hero', EntityOp.ADD_ONE, hero);
    });

    it('should run inner default reducer as expected', () => {
      const state = entityReducer({}, addOneAction);

      // inner default reducer worked as expected
      const collection = state['Hero'];
      expect(collection.ids.length).toBe(1, 'should have added one');
      expect(collection.entities[42]).toEqual(hero, 'should be added hero');
    });

    it('should call meta reducers for inner default reducer as expected', () => {
      const expected = [
        { metaReducer: 'A', inOut: 'in',  action: addOneAction },
        { metaReducer: 'B', inOut: 'in',  action: addOneAction },
        { metaReducer: 'B', inOut: 'out', action: addOneAction },
        { metaReducer: 'A', inOut: 'out', action: addOneAction },
      ];

      const state = entityReducer({}, addOneAction);
      expect(metaReducerA).toHaveBeenCalled();
      expect(metaReducerB).toHaveBeenCalled();
      expect(metaReducerOutput).toEqual(expected);
    });

    it('should call meta reducers for custom registered reducer', () => {
      const reducer = createNoopReducer();
      entityReducerFactory.registerReducer('Foo', reducer);
      const action = entityActionFactory.create<Foo>(
        'Foo', EntityOp.ADD_ONE, {id: 'forty-two', foo: 'fooz'});

      const state = entityReducer({}, action);
      expect(metaReducerA).toHaveBeenCalled();
      expect(metaReducerB).toHaveBeenCalled();
    });

    it('should call meta reducers for multiple registered reducers', () => {
      const reducer = createNoopReducer();
      const reducers: EntityCollectionReducers = {
        Foo: reducer,
        Hero: reducer
      }
      entityReducerFactory.registerReducers(reducers);

      const fooAction = entityActionFactory.create<Foo>(
        'Foo', EntityOp.ADD_ONE, {id: 'forty-two', foo: 'fooz'});

      entityReducer({}, fooAction);
      expect(metaReducerA).toHaveBeenCalled();
      expect(metaReducerB).toHaveBeenCalled();

      const heroAction = entityActionFactory.create<Hero>(
        'Hero', EntityOp.ADD_ONE, {id: 84, name: 'Alex'});

      entityReducer({}, heroAction);
      expect(metaReducerA).toHaveBeenCalledTimes(2);
      expect(metaReducerB).toHaveBeenCalledTimes(2);
    });
  });
});

function createNoopReducer<T>() {
  return function NoopReducer(collection: EntityCollection<T>, action: EntityAction): EntityCollection<T> {
   return collection;
  }
}


