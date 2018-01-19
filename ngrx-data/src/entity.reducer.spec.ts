import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';

import { EntityAction, EntityOp } from './entity.actions';
import { EntityCache } from './interfaces';
import { EntityCollection } from './entity-definition';
import { EntityDefinitionService } from './entity-definition.service';
import { EntityMetadataMap } from './entity-metadata';
import { Update } from './ngrx-entity-models';

import {
  createEntityReducer,
  createEntityCollectionReducer,
  EntityCollectionReducer
} from './entity.reducer';

export class Foo { id: string; foo: string; }
export class Hero { id: number; name: string; }
export class Villain { key: string; name: string; }

const metadata: EntityMetadataMap = {
  Hero: {entityName: 'Hero'},
  Villain: {entityName: 'Villain', selectId: (villain: Villain) => villain.key },
}

describe('EntityReducer', () => {
  let entityReducer: (state: EntityCache, action: EntityAction) => EntityCache;

  let initialHeroes: Hero[];
  let initialCache: EntityCache;

  beforeEach(() => {
    const eds = new EntityDefinitionService([metadata]);
    entityReducer = createEntityReducer(eds);
    initialHeroes = [ {id: 2, name: 'B'}, {id: 1, name: 'A'} ];
    initialCache = initializeCache();
  });

  /** Initialize cache with a Hero collection using QUERY_ALL_SUCCESS */
  function initializeCache() {
    const action = new EntityAction('Hero', EntityOp.QUERY_ALL_SUCCESS, initialHeroes);
    return entityReducer({}, action);
  }

  describe('#QUERY_ALL', () => {
    it('QUERY_ALL sets loading flag but does not fill collection', () => {
      const action = new EntityAction('Hero', EntityOp.QUERY_ALL);
      const state = entityReducer({}, action);
      const collection = state['Hero'];
      expect(collection.loading).toBe(true, 'should be loading');
      expect(collection.ids.length).toBe(0, 'should be empty collection');
    });

    it('QUERY_ALL_SUCCESS clears loading flag and fills collection', () => {
      const heroes: Hero[] = [
        {id: 2, name: 'B'},
        {id: 1, name: 'A'},
      ];
      const action = new EntityAction('Hero', EntityOp.QUERY_ALL_SUCCESS, heroes);
      const state = entityReducer({}, action);
      const collection = state['Hero'];
      expect(collection.loading).toBe(false, 'should not be loading');
      expect(collection.ids).toEqual([2, 1], 'should have expected ids in load order');
      expect(collection.entities['1']).toBe(heroes[1], 'hero with id:1');
      expect(collection.entities['2']).toBe(heroes[0], 'hero with id:2');
    });

    it('QUERY_ALL_ERROR clears loading flag and does not fill collection', () => {
      const action = new EntityAction('Hero', EntityOp.QUERY_ALL_ERROR);
      const state = entityReducer({}, action);
      const collection = state['Hero'];
      expect(collection.loading).toBe(false, 'should not be loading');
      expect(collection.ids.length).toBe(0, 'should be empty collection');
    });

    it('QUERY_ALL_SUCCESS works for "Villain" entity with non-id primary key', () => {
      const villains: Villain[] = [
        {key: '2', name: 'B'},
        {key: '1', name: 'A'},
      ]
      const action = new EntityAction('Villain', EntityOp.QUERY_ALL_SUCCESS, villains);
      const state = entityReducer({}, action);
      const collection = state['Villain'];
      expect(collection.loading).toBe(false, 'should not be loading');
      expect(collection.ids).toEqual(['2', '1'], 'should have expected ids in load order');
      expect(collection.entities['1']).toBe(villains[1], 'villain with key:1');
      expect(collection.entities['2']).toBe(villains[0], 'villain with key:2');
    });
  });

  describe('#QUERY_MANY', () => {
    it('QUERY_MANY sets loading flag but does not touch the collection', () => {
      const action = new EntityAction('Hero', EntityOp.QUERY_MANY);
      const state = entityReducer({}, action);
      const collection = state['Hero'];
      expect(collection.loading).toBe(true, 'should be loading');
      expect(collection.ids.length).toBe(0, 'should be empty collection');
    });

    it('QUERY_MANY_SUCCESS can create the initial collection', () => {
      const heroes: Hero[] = [{id: 3, name: 'C'}];
      const action = new EntityAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      const nextCache = entityReducer({}, action);
      const collection = nextCache['Hero'];

      expect(collection.ids).toEqual([3], 'should have expected ids in load order');
    });

    it('QUERY_MANY_SUCCESS can add to existing collection', () => {
      const heroes: Hero[] = [{id: 3, name: 'C'}];
      const action = new EntityAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      const nextCache = entityReducer(initialCache, action);
      const collection = nextCache['Hero'];

      expect(collection.ids).toEqual([2, 1, 3], 'should have expected ids in load order');
    });

    it('QUERY_MANY_SUCCESS can update existing collection', () => {
      const heroes: Hero[] = [{id: 1, name: 'A+'}];
      const action = new EntityAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      const nextCache = entityReducer(initialCache, action);
      const collection = nextCache['Hero'];

      expect(collection.ids).toEqual([2, 1], 'should have expected ids in load order');
      expect(collection.entities['1'].name).toBe('A+', 'should update hero:1');
    });

    it('QUERY_MANY_SUCCESS can add and update existing collection', () => {
      const heroes: Hero[] = [
        {id: 3, name: 'C'},
        {id: 1, name: 'A+'},
      ];
      const action = new EntityAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      const nextCache = entityReducer(initialCache, action);
      const collection = nextCache['Hero'];

      expect(collection.ids).toEqual([2, 1, 3], 'should have expected ids in load order');
      expect(collection.entities['1'].name).toBe('A+', 'should update hero:1');
    });

    it('QUERY_MANY_SUCCESS works when the query results are empty', () => {
      const heroes: Hero[] = [];
      const action = new EntityAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      const nextCache = entityReducer(initialCache, action);
      const collection = nextCache['Hero'];

      expect(collection.entities).toBe(initialCache['Hero'].entities, 'collection.entities should be untouched');
      expect(collection.ids).toBe(initialCache['Hero'].ids, 'collection.entities should be untouched');
      expect(collection.ids).toEqual([2, 1], 'ids were not mutated');
      expect(collection).not.toBe(initialCache['Hero'], 'collection changed by loading flag');
    });

  });

  describe('reducer override', () => {

    beforeEach(() => {
      const eds = new EntityDefinitionService([metadata]);
      const def = eds.getDefinition<Hero>('Hero');
      def.reducer = createReadOnlyHeroReducer(def.entityAdapter);
      entityReducer = createEntityReducer(eds);
    });

    it('QUERY_ALL_SUCCESS clears loading flag and fills collection', () => {
      const heroes: Hero[] = [
        {id: 2, name: 'B'},
        {id: 1, name: 'A'},
      ];
      const action = new EntityAction('Hero', EntityOp.QUERY_ALL_SUCCESS, heroes);
      const state = entityReducer({}, action);
      const collection = state['Hero'];
      expect(collection.loading).toBe(false, 'should not be loading');
      expect(collection.ids).toEqual([2, 1], 'should have expected ids in load order');
      expect(collection.entities['1']).toBe(heroes[1], 'hero with id:1');
      expect(collection.entities['2']).toBe(heroes[0], 'hero with id:2');
    });

    it('QUERY_ALL_ERROR clears loading flag and does not fill collection', () => {
      const action = new EntityAction('Hero', EntityOp.QUERY_ALL_ERROR);
      const state = entityReducer({}, action);
      const collection = state['Hero'];
      expect(collection.loading).toBe(false, 'should not be loading');
      expect(collection.ids.length).toBe(0, 'should be empty collection');
    });

    it('QUERY_ALL_SUCCESS works for "Villain" entity with non-id primary key', () => {
      const villains: Villain[] = [
        {key: '2', name: 'B'},
        {key: '1', name: 'A'},
      ]
      const action = new EntityAction('Villain', EntityOp.QUERY_ALL_SUCCESS, villains);
      const state = entityReducer({}, action);
      const collection = state['Villain'];
      expect(collection.loading).toBe(false, 'should not be loading');
      expect(collection.ids).toEqual(['2', '1'], 'should have expected ids in load order');
      expect(collection.entities['1']).toBe(villains[1], 'villain with key:1');
      expect(collection.entities['2']).toBe(villains[0], 'villain with key:2');
    });

    it('QUERY_MANY is illegal for "Hero" collection', () => {
      const action = new EntityAction('Hero', EntityOp.QUERY_MANY);
      expect(() => entityReducer({}, action) )
        .toThrowError(/illegal operation for the "Hero" collection/);
    });

    it('QUERY_MANY still works for "Villain" collection', () => {
      const action = new EntityAction('Villain', EntityOp.QUERY_MANY);
      const state = entityReducer({}, action);
      const collection = state['Villain'];
      expect(collection.loading).toBe(true, 'should be loading');
    });

    /** Make Hero collection readonly except for QUERY_ALL  */
    function createReadOnlyHeroReducer(adapter: EntityAdapter<Hero>) {
      return function heroReducer(collection: EntityCollection<Hero>, action: EntityAction): EntityCollection<Hero> {
        switch (action.op) {

          case EntityOp.QUERY_ALL:
            return collection.loading ? collection : { ...collection, loading: true };

          case EntityOp.QUERY_ALL_SUCCESS:
          return {
            ...adapter.addAll(action.payload, collection),
            loading: false
          };

          case EntityOp.QUERY_ALL_ERROR: {
            return collection.loading ? { ...collection, loading: false } : collection;
          }

          default:
            throw new Error(`${action.op} is an illegal operation for the "Hero" collection`);
        }
      }
    }

  });
})

