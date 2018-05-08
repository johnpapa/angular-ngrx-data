import { Action, ActionReducer, MetaReducer } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';

import { EntityAction, EntityActionFactory } from '../actions/entity-action';
import { EntityOp } from '../actions/entity-op';
import { EntityCache } from './entity-cache';
import {
  EntityCacheMerge,
  EntityCacheSet
} from '../actions/entity-cache-actions';
import { EntityCollection } from './entity-collection';
import { EntityCollectionCreator } from './entity-collection-creator';
import { DefaultEntityCollectionReducerMethodsFactory } from './default-entity-collection-reducer-methods';

import { EntityDefinitionService } from '../entity-metadata/entity-definition.service';
import { EntityMetadataMap } from '../entity-metadata/entity-metadata';
import { Logger } from '../utils/interfaces';
import { IdSelector, Update } from '../utils/ngrx-entity-models';

import {
  EntityCollectionReducer,
  EntityCollectionReducerFactory
} from './entity-collection-reducer';
import {
  EntityCollectionReducers,
  EntityReducerFactory
} from './entity-reducer';

class Bar {
  id: number;
  bar: string;
}
class Foo {
  id: string;
  foo: string;
}
class Hero {
  id: number;
  name: string;
  power?: string;
}
class Villain {
  key: string;
  name: string;
}

const metadata: EntityMetadataMap = {
  Hero: {},
  Villain: { selectId: (villain: Villain) => villain.key }
};

describe('EntityReducer', () => {
  // action factory never changes in these tests
  const entityActionFactory = new EntityActionFactory();
  const createAction: <P = any>(
    entityName: string,
    op: EntityOp,
    payload?: P
  ) => EntityAction = entityActionFactory.create.bind(entityActionFactory);

  let collectionCreator: EntityCollectionCreator;
  let collectionReducerFactory: EntityCollectionReducerFactory;
  let eds: EntityDefinitionService;
  let entityReducer: ActionReducer<EntityCache, Action>;
  let entityReducerFactory: EntityReducerFactory;
  let logger: Logger;

  beforeEach(() => {
    eds = new EntityDefinitionService([metadata]);
    collectionCreator = new EntityCollectionCreator(eds);
    const collectionReducerMethodsFactory = new DefaultEntityCollectionReducerMethodsFactory(
      eds
    );
    collectionReducerFactory = new EntityCollectionReducerFactory(
      collectionReducerMethodsFactory
    );
    logger = jasmine.createSpyObj('Logger', ['error', 'log', 'warn']);

    entityReducerFactory = new EntityReducerFactory(
      collectionCreator,
      collectionReducerFactory,
      logger
    );
  });

  describe('#create', () => {
    beforeEach(() => {
      entityReducer = entityReducerFactory.create();
    });

    it('creates a default hero reducer when QUERY_ALL for hero', () => {
      const hero: Hero = { id: 42, name: 'Bobby' };
      const action = createAction<Hero>('Hero', EntityOp.ADD_ONE, hero);

      const state = entityReducer({}, action);
      const collection = state['Hero'];
      expect(collection.ids.length).toBe(1, 'should have added one');
      expect(collection.entities[42]).toEqual(hero, 'should be added hero');
    });

    it('throws when ask for reducer of unknown entity type', () => {
      const action = entityActionFactory.create('Foo', EntityOp.QUERY_ALL);
      expect(() => entityReducer({}, action)).toThrowError(
        /no EntityDefinition/i
      );
    });
  });

  describe('#registerReducer', () => {
    beforeEach(() => {
      entityReducer = entityReducerFactory.create();
    });

    it('can register a new reducer', () => {
      const reducer = createNoopReducer();
      entityReducerFactory.registerReducer('Foo', reducer);
      const action = entityActionFactory.create<Foo>('Foo', EntityOp.ADD_ONE, {
        id: 'forty-two',
        foo: 'fooz'
      });
      // Must initialize the state by hand
      const state = entityReducer({}, action);
      const collection = state['Foo'];
      expect(collection.ids.length).toBe(0, 'ADD_ONE should do nothing');
    });

    it('can replace existing reducer by registering with same name', () => {
      // Just like ADD_ONE test above with default reducer
      // but this time should not add the hero.
      const hero: Hero = { id: 42, name: 'Bobby' };
      const reducer = createNoopReducer();
      entityReducerFactory.registerReducer('Hero', reducer);
      const action = entityActionFactory.create<Hero>(
        'Hero',
        EntityOp.ADD_ONE,
        hero
      );
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
    let initialHeroes: Hero[];
    let initialCache: EntityCache;

    beforeEach(() => {
      entityReducer = entityReducerFactory.create();
      initialHeroes = [
        { id: 2, name: 'B', power: 'Fast' },
        { id: 1, name: 'A', power: 'invisible' }
      ];
      initialCache = createInitialCache({ Hero: initialHeroes });
    });

    describe('#SET_ENTITY_CACHE', () => {
      it('should initialize cache', () => {
        const cache = createInitialCache({
          Hero: initialHeroes,
          Villain: [{ key: 'DE', name: 'Dr. Evil' }]
        });

        const action = new EntityCacheSet(cache);
        // const action = {  // equivalent
        //   type: SET_ENTITY_CACHE,
        //   payload: cache
        // };

        const state = entityReducer(cache, action);
        expect(state['Hero'].ids).toEqual([2, 1], 'Hero ids');
        expect(state['Hero'].entities).toEqual({
          1: initialHeroes[1],
          2: initialHeroes[0]
        });
        expect(state['Villain'].ids).toEqual(['DE'], 'Villain ids');
      });

      it('should clear the cache when set with empty object', () => {
        const action = new EntityCacheSet({});
        const state = entityReducer(initialCache, action);
        expect(Object.keys(state)).toEqual([]);
      });

      it('should replace prior cache with new cache', () => {
        const priorCache = createInitialCache({
          Hero: initialHeroes,
          Villain: [{ key: 'DE', name: 'Dr. Evil' }]
        });

        const newHeroes = [{ id: 42, name: 'Bobby' }];
        const newCache = createInitialCache({ Hero: newHeroes });

        const action = new EntityCacheSet(newCache);
        const state = entityReducer(priorCache, action);
        expect(state['Villain']).toBeUndefined('No villains');

        const heroCollection = state['Hero'];
        expect(heroCollection.ids).toEqual([42], 'hero ids');
        expect(heroCollection.entities[42]).toEqual(newHeroes[0], 'heroes');
      });
    });

    describe('#MERGE_ENTITY_CACHE', () => {
      function shouldHaveExpectedHeroes(state: EntityCache) {
        expect(state['Hero'].ids).toEqual([2, 1], 'Hero ids');
        expect(state['Hero'].entities).toEqual({
          1: initialHeroes[1],
          2: initialHeroes[0]
        });
      }

      it('should initialize an empty cache', () => {
        const cache = createInitialCache({
          Hero: initialHeroes,
          Villain: [{ key: 'DE', name: 'Dr. Evil' }]
        });

        const action = new EntityCacheMerge(cache);
        // const action = {
        //   type: MERGE_ENTITY_CACHE,
        //   payload: cache
        // };

        const state = entityReducer({}, action);
        shouldHaveExpectedHeroes(state);
        expect(state['Villain'].ids).toEqual(['DE'], 'Villain ids');
      });

      it('should return cache matching existing cache when merge empty', () => {
        const action = new EntityCacheMerge({});
        const state = entityReducer(initialCache, action);
        shouldHaveExpectedHeroes(state);
      });

      it('should add a new collection to existing cache', () => {
        const mergeCache = createInitialCache({
          Villain: [{ key: 'DE', name: 'Dr. Evil' }]
        });
        const action = new EntityCacheMerge(mergeCache);
        const state = entityReducer(initialCache, action);
        shouldHaveExpectedHeroes(state);
        expect(state['Villain'].ids).toEqual(['DE'], 'Villain ids');
      });

      it('should overwrite an existing cached collection', () => {
        const mergeCache = createInitialCache({
          Hero: [{ id: 42, name: 'Bobby' }]
        });
        const action = new EntityCacheMerge(mergeCache);
        const state = entityReducer(initialCache, action);
        const heroCollection = state['Hero'];
        expect(heroCollection.ids).toEqual([42], 'revised ids');
        expect(heroCollection.entities[42]).toEqual(
          { id: 42, name: 'Bobby' },
          'revised heroes'
        );
      });
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
      };
      entityReducerFactory.registerReducers(reducers);

      const fooAction = entityActionFactory.create<Foo>(
        'Foo',
        EntityOp.ADD_ONE,
        { id: 'forty-two', foo: 'fooz' }
      );
      const barAction = entityActionFactory.create<Bar>(
        'Bar',
        EntityOp.ADD_ONE,
        { id: 84, bar: 'baz' }
      );

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
      };
      entityReducerFactory.registerReducers(reducers);

      const fooAction = entityActionFactory.create<Foo>(
        'Foo',
        EntityOp.ADD_ONE,
        { id: 'forty-two', foo: 'fooz' }
      );
      const heroAction = entityActionFactory.create<Hero>(
        'Hero',
        EntityOp.ADD_ONE,
        { id: 84, name: 'Alex' }
      );

      let state = entityReducer({}, fooAction);
      state = entityReducer(state, heroAction);

      expect(state['Foo'].ids.length).toBe(0, 'ADD_ONE Foo should do nothing');
      expect(state['Hero'].ids.length).toBe(
        0,
        'ADD_ONE Hero should do nothing'
      );
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
        };
      };
    }

    let addOneAction: EntityAction<Hero>;
    let hero: Hero;

    beforeEach(() => {
      metaReducerOutput = [];
      metaReducerA = jasmine
        .createSpy('metaReducerA')
        .and.callFake(testMetadataReducerFactory('A'));
      metaReducerB = jasmine
        .createSpy('metaReducerA')
        .and.callFake(testMetadataReducerFactory('B'));
      const metaReducers = [metaReducerA, metaReducerB];

      entityReducerFactory = new EntityReducerFactory(
        collectionCreator,
        collectionReducerFactory,
        logger,
        metaReducers
      );

      entityReducer = entityReducerFactory.create();

      hero = { id: 42, name: 'Bobby' };
      addOneAction = entityActionFactory.create<Hero>(
        'Hero',
        EntityOp.ADD_ONE,
        hero
      );
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
        { metaReducer: 'A', inOut: 'in', action: addOneAction },
        { metaReducer: 'B', inOut: 'in', action: addOneAction },
        { metaReducer: 'B', inOut: 'out', action: addOneAction },
        { metaReducer: 'A', inOut: 'out', action: addOneAction }
      ];

      const state = entityReducer({}, addOneAction);
      expect(metaReducerA).toHaveBeenCalled();
      expect(metaReducerB).toHaveBeenCalled();
      expect(metaReducerOutput).toEqual(expected);
    });

    it('should call meta reducers for custom registered reducer', () => {
      const reducer = createNoopReducer();
      entityReducerFactory.registerReducer('Foo', reducer);
      const action = entityActionFactory.create<Foo>('Foo', EntityOp.ADD_ONE, {
        id: 'forty-two',
        foo: 'fooz'
      });

      const state = entityReducer({}, action);
      expect(metaReducerA).toHaveBeenCalled();
      expect(metaReducerB).toHaveBeenCalled();
    });

    it('should call meta reducers for multiple registered reducers', () => {
      const reducer = createNoopReducer();
      const reducers: EntityCollectionReducers = {
        Foo: reducer,
        Hero: reducer
      };
      entityReducerFactory.registerReducers(reducers);

      const fooAction = entityActionFactory.create<Foo>(
        'Foo',
        EntityOp.ADD_ONE,
        { id: 'forty-two', foo: 'fooz' }
      );

      entityReducer({}, fooAction);
      expect(metaReducerA).toHaveBeenCalled();
      expect(metaReducerB).toHaveBeenCalled();

      const heroAction = entityActionFactory.create<Hero>(
        'Hero',
        EntityOp.ADD_ONE,
        { id: 84, name: 'Alex' }
      );

      entityReducer({}, heroAction);
      expect(metaReducerA).toHaveBeenCalledTimes(2);
      expect(metaReducerB).toHaveBeenCalledTimes(2);
    });
  });

  // #region helpers
  function createCollection<T = any>(
    entityName: string,
    data: T[],
    selectId: IdSelector<any>
  ) {
    return {
      ...collectionCreator.create<T>(entityName),
      ids: data.map(e => selectId(e)) as string[] | number[],
      entities: data.reduce(
        (acc, e) => {
          acc[selectId(e)] = e;
          return acc;
        },
        {} as any
      )
    } as EntityCollection<T>;
  }

  function createInitialCache(entityMap: { [entityName: string]: any[] }) {
    const cache: EntityCache = {};
    // tslint:disable-next-line:forin
    for (const entityName in entityMap) {
      const selectId =
        metadata[entityName].selectId || ((entity: any) => entity.id);
      cache[entityName] = createCollection(
        entityName,
        entityMap[entityName],
        selectId
      );
    }

    return cache;
  }

  function createNoopReducer<T>() {
    return function NoopReducer(
      collection: EntityCollection<T>,
      action: EntityAction
    ): EntityCollection<T> {
      return collection;
    };
  }
  // #endregion helpers
});
