import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';

import { EntityAction, EntityActionFactory, EntityOp } from '../actions';
import { EntityCollection } from './entity-collection';

import { EntityCache } from './entity-cache';
import { EntityCollectionCreator } from './entity-collection-creator';
import { EntityDefinitionService } from '../entity-metadata';
import { EntityMetadataMap } from '../entity-metadata';
import { Update } from '../utils';
import { toUpdateFactory } from '../utils';

import { EntityCollectionReducer, EntityCollectionReducerFactory } from './entity-collection.reducer';
import { EntityCollectionReducers, EntityReducerFactory } from './entity-reducer';

export class Foo { id: string; foo: string; }
export class Hero { id: number; name: string; power?: string }
export class Villain { key: string; name: string; }

const metadata: EntityMetadataMap = {
  Hero: {},
  Villain: { selectId: (villain: Villain) => villain.key },
}

describe('EntityCollectionReducer', () => {
  // action factory never changes in these tests
  const entityActionFactory = new EntityActionFactory();
  const createAction:
    (entityName: string, op: EntityOp, payload?: any) => EntityAction = entityActionFactory.create.bind(entityActionFactory);

  const toHeroUpdate = toUpdateFactory<Hero>();

  let entityReducerFactory: EntityReducerFactory;
  let entityReducer: (state: EntityCache, action: EntityAction) => EntityCache;

  let initialHeroes: Hero[];
  let initialCache: EntityCache;

  beforeEach(() => {
    const eds = new EntityDefinitionService([metadata]);
    const collectionCreator = new EntityCollectionCreator(eds);
    const collectionReducerFactory = new EntityCollectionReducerFactory();

    entityReducerFactory = new EntityReducerFactory(
      eds, collectionCreator, collectionReducerFactory);

    entityReducer = entityReducerFactory.create();

    initialHeroes = [
      {id: 2, name: 'B', power: 'Fast'},
      {id: 1, name: 'A', power: 'invisible'}
    ];
    initialCache = initializeCache();
  });

  /** Initialize a cache with a Hero collection using QUERY_ALL_SUCCESS */
  function initializeCache() {
    const action = createAction('Hero', EntityOp.QUERY_ALL_SUCCESS, initialHeroes);
    return entityReducer({}, action);
  }

  describe('#QUERY_ALL', () => {
    const queryAction = createAction('Hero', EntityOp.QUERY_ALL);

    it('QUERY_ALL sets loading flag but does not fill collection', () => {
      const state = entityReducer({}, queryAction);
      const collection = state['Hero'];
      expect(collection.ids.length).toBe(0, 'should be empty collection');
      expect(collection.loaded).toBe(false, 'should not be loaded');
      expect(collection.loading).toBe(true, 'should be loading');
    });

    it('QUERY_ALL_SUCCESS clears loading flag and fills collection', () => {
      let state = entityReducer({}, queryAction);
      const heroes: Hero[] = [
        {id: 2, name: 'B'},
        {id: 1, name: 'A'},
      ];
      const action = createAction('Hero', EntityOp.QUERY_ALL_SUCCESS, heroes);
      state = entityReducer(state, action);
      const collection = state['Hero'];
      expect(collection.ids).toEqual([2, 1], 'should have expected ids in load order');
      expect(collection.entities['1']).toBe(heroes[1], 'hero with id:1');
      expect(collection.entities['2']).toBe(heroes[0], 'hero with id:2');
      expect(collection.loaded).toBe(true, 'should be loaded');
      expect(collection.loading).toBe(false, 'should not be loading');
    });

    it('QUERY_ALL_SUCCESS replaces previous collection contents with new contents', () => {
      let state: EntityCache = {
        Hero: {
          ids: [42],
          entities: {42: { id: 42, name: 'Fribit' } },
          filter: 'xxx',
          loaded: true,
          loading: false,
          originalValues: {}
        }
      }
      state = entityReducer(state, queryAction);
      const heroes: Hero[] = [
        {id: 2, name: 'B'},
        {id: 1, name: 'A'},
      ];
      const action = createAction('Hero', EntityOp.QUERY_ALL_SUCCESS, heroes);
      state = entityReducer(state, action);
      const collection = state['Hero'];
      expect(collection.ids).toEqual([2, 1], 'should have expected ids in load order');
      expect(collection.entities['1']).toBe(heroes[1], 'hero with id:1');
      expect(collection.entities['2']).toBe(heroes[0], 'hero with id:2');
      expect(collection.loaded).toBe(true, 'should be loaded');
      expect(collection.loading).toBe(false, 'should not be loading');
    });

    it('QUERY_ALL_ERROR clears loading flag and does not fill collection', () => {
      let state = entityReducer({}, queryAction);
      const action = createAction('Hero', EntityOp.QUERY_ALL_ERROR);
      state = entityReducer(state, action);
      const collection = state['Hero'];
      expect(collection.loading).toBe(false, 'should not be loading');
      expect(collection.loaded).toBe(false, 'should not be loaded');
      expect(collection.ids.length).toBe(0, 'should be empty collection');
    });

    it('QUERY_ALL_SUCCESS works for "Villain" entity with non-id primary key', () => {
      let state = entityReducer({}, queryAction);
      const villains: Villain[] = [
        {key: '2', name: 'B'},
        {key: '1', name: 'A'},
      ]
      const action = createAction('Villain', EntityOp.QUERY_ALL_SUCCESS, villains);
      state = entityReducer(state, action);
      const collection = state['Villain'];
      expect(collection.ids).toEqual(['2', '1'], 'should have expected ids in load order');
      expect(collection.entities['1']).toBe(villains[1], 'villain with key:1');
      expect(collection.entities['2']).toBe(villains[0], 'villain with key:2');
      expect(collection.loaded).toBe(true, 'should be loaded');
      expect(collection.loading).toBe(false, 'should not be loading');
    });
  });

  describe('#QUERY_BY_KEY', () => {
    const queryAction = createAction('Hero', EntityOp.QUERY_BY_KEY);

    it('QUERY_BY_KEY sets loading flag but does not touch the collection', () => {
      const state = entityReducer({}, queryAction);
      const collection = state['Hero'];
      expect(collection.ids.length).toBe(0, 'should be empty collection');
      expect(collection.loaded).toBe(false, 'should not be loaded');
      expect(collection.loading).toBe(true, 'should be loading');
    });

    it('QUERY_BY_KEY_SUCCESS can create the initial collection', () => {
      let state = entityReducer({}, queryAction);
      const hero: Hero = {id: 3, name: 'C'};
      const action = createAction('Hero', EntityOp.QUERY_BY_KEY_SUCCESS, hero);
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([3], 'should have expected ids in load order');
      expect(collection.loaded).toBe(false, 'should not be loaded');
      expect(collection.loading).toBe(false, 'should not be loading');
    });

    it('QUERY_BY_KEY_SUCCESS can add to existing collection', () => {
      let state = entityReducer(initialCache, queryAction);
      const hero: Hero = {id: 3, name: 'C'};
      const action = createAction('Hero', EntityOp.QUERY_BY_KEY_SUCCESS, hero);
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 3], 'should have expected ids in load order');
    });

    it('QUERY_BY_KEY_SUCCESS can update existing collection', () => {
      let state = entityReducer(initialCache, queryAction);
      const hero: Hero = {id: 1, name: 'A+'};
      const action = createAction('Hero', EntityOp.QUERY_BY_KEY_SUCCESS, hero);
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'should have expected ids in load order');
      expect(collection.entities['1'].name).toBe('A+', 'should update hero:1');
    });

    // Normally would 404 but maybe this API just returns an empty result.
    it('QUERY_BY_KEY_SUCCESS works when the query results are empty', () => {
      let state = entityReducer(initialCache, queryAction);
      const action = createAction('Hero', EntityOp.QUERY_BY_KEY_SUCCESS, undefined);
      state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.entities).toBe(initialCache['Hero'].entities, 'collection.entities should be untouched');
      expect(collection.ids).toBe(initialCache['Hero'].ids, 'collection.entities should be untouched');
      expect(collection.ids).toEqual([2, 1], 'ids were not mutated');
    });

  });

  describe('#QUERY_MANY', () => {
    const queryAction = createAction('Hero', EntityOp.QUERY_MANY);

    it('QUERY_MANY sets loading flag but does not touch the collection', () => {
      const state = entityReducer({}, queryAction);
      const collection = state['Hero'];
      expect(collection.loaded).toBe(false, 'should not be loaded');
      expect(collection.loading).toBe(true, 'should be loading');
      expect(collection.ids.length).toBe(0, 'should be empty collection');
    });

    it('QUERY_MANY_SUCCESS can create the initial collection', () => {
      let state = entityReducer({}, queryAction);
      const heroes: Hero[] = [{id: 3, name: 'C'}];
      const action = createAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([3], 'should have expected ids in load order');
      expect(collection.loaded).toBe(false, 'should not be loaded');
      expect(collection.loading).toBe(false, 'should not be loading');
    });

    it('QUERY_MANY_SUCCESS can add to existing collection', () => {
      let state = entityReducer(initialCache, queryAction);
      const heroes: Hero[] = [{id: 3, name: 'C'}];
      const action = createAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 3], 'should have expected ids in load order');
    });

    it('QUERY_MANY_SUCCESS can update existing collection', () => {
      let state = entityReducer(initialCache, queryAction);
      const heroes: Hero[] = [{id: 1, name: 'A+'}];
      const action = createAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'should have expected ids in load order');
      expect(collection.entities['1'].name).toBe('A+', 'should update hero:1');
    });

    it('QUERY_MANY_SUCCESS can add and update existing collection', () => {
      let state = entityReducer(initialCache, queryAction);
      const heroes: Hero[] = [
        {id: 3, name: 'C'},
        {id: 1, name: 'A+'},
      ];
      const action = createAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 3], 'should have expected ids in load order');
      expect(collection.entities['1'].name).toBe('A+', 'should update hero:1');
    });

    it('QUERY_MANY_SUCCESS works when the query results are empty', () => {
      let state = entityReducer(initialCache, queryAction);
      const action = createAction('Hero', EntityOp.QUERY_MANY_SUCCESS, []);
      state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.entities).toBe(initialCache['Hero'].entities, 'collection.entities should be untouched');
      expect(collection.ids).toBe(initialCache['Hero'].ids, 'collection.entities should be untouched');
      expect(collection.ids).toEqual([2, 1], 'ids were not mutated');
      expect(collection).not.toBe(initialCache['Hero'], 'collection changed by loading flag');
    });

  });

  describe('#SAVE_ADD_ONE_OPTIMISTIC', () => {

    function createTestAction(hero: Hero)  {
      return createAction('Hero', EntityOp.SAVE_ADD_ONE_OPTIMISTIC, hero);
    }

    it('should add a new hero to collection', () => {
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(hero);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 13], 'no new hero');
    });

    it('should error if new hero lacks its pkey', () => {
      const hero = { name: 'New One', power: 'Strong' };
      // bad add, no id.
      const action = createTestAction(<any> hero);
      const state = entityReducer(initialCache, action);
      expect(state).toBe(initialCache);
      expect(action.error.message)
        .toMatch(/payload is not an entity with a valid key/);
    });

    it('should NOT update an existing entity in collection', () => {
      const hero: Hero = { id: 2, name: 'B+' };
      const action = createTestAction(hero);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[2].name).toBe('B', 'same old name');
      // unmentioned property stays the same
      expect(collection.entities[2].power).toBe('Fast', 'power');
    });
  });

  describe('#SAVE_ADD_SUCCESS', () => {

    function createTestAction(hero: Hero)  {
      return createAction('Hero', EntityOp.SAVE_ADD_ONE_SUCCESS, hero);
    }

    it('should add a new hero to collection', () => {
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(hero);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 13], 'no new hero');
    });

    it('should error if new hero lacks its pkey', () => {
      const hero = { name: 'New One', power: 'Strong' };
      // bad add, no id.
      const action = createTestAction(<any> hero);
      const state = entityReducer(initialCache, action);
      expect(state).toBe(initialCache);
      expect(action.error.message)
        .toMatch(/payload is not an entity with a valid key/);
    });

    it('should NOT update an existing entity in collection', () => {
      const hero: Hero = { id: 2, name: 'B+' };
      const action = createTestAction(hero);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[2].name).toBe('B', 'same old name');
      // unmentioned property stays the same
      expect(collection.entities[2].power).toBe('Fast', 'power');
    });
  });

  describe('#SAVE_UPDATE_ONE_OPTIMISTIC', () => {

    function createTestAction(hero: Update<Hero>)  {
      return createAction('Hero', EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC, hero);
    }

    it('should update existing entity in collection', () => {
      const hero: Hero = { id: 2, name: 'B+' };
      const action = createTestAction(toHeroUpdate(hero));
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[2].name).toBe('B+', 'name');
      // unmentioned property stays the same
      expect(collection.entities[2].power).toBe('Fast', 'power');
    });

    it('can update existing entity\'s key in collection', () => {
      // Change the pkey (id) and the name of former hero:2
      const hero: Hero = { id: 42, name: 'Super' };
      const update = {id: 2, changes: hero };
      const action = createTestAction(update);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([42, 1], 'ids are the same');
      expect(collection.entities[42].name).toBe('Super', 'name');
      // unmentioned property stays the same
      expect(collection.entities[42].power).toBe('Fast', 'power');
    });

    // Effectively an upsert
    it('should add new hero to collection', () => {
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(toHeroUpdate(hero));
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 13], 'new hero:13');
      expect(collection.entities[13].name).toBe('New One', 'name');
      expect(collection.entities[13].power).toBe('Strong', 'power');
    });
  });

  describe('#SAVE_UPDATE_SUCCESS', () => {

    function createTestAction(hero: Update<Hero>)  {
      return createAction('Hero', EntityOp.SAVE_UPDATE_ONE_SUCCESS, hero);
    }

    it('should update existing entity in collection', () => {
      const hero: Hero = { id: 2, name: 'B+' };
      const action = createTestAction(toHeroUpdate(hero));
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[2].name).toBe('B+', 'name');
      // unmentioned property stays the same
      expect(collection.entities[2].power).toBe('Fast', 'power');
    });

    it('can update existing entity\'s key in collection', () => {
      // Change the pkey (id) and the name of former hero:2
      const hero: Hero = { id: 42, name: 'Super' };
      const update = {id: 2, changes: hero };
      const action = createTestAction(update);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([42, 1], 'ids are the same');
      expect(collection.entities[42].name).toBe('Super', 'name');
      // unmentioned property stays the same
      expect(collection.entities[42].power).toBe('Fast', 'power');
    });

    // Effectively an upsert
    it('should add new hero to collection', () => {
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(toHeroUpdate(hero));
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 13], 'new hero:13');
      expect(collection.entities[13].name).toBe('New One', 'name');
      expect(collection.entities[13].power).toBe('Strong', 'power');
    });
  });

  describe('#ADD_ONE', () => {

    function createTestAction(hero: Hero)  {
      return createAction('Hero', EntityOp.ADD_ONE, hero);
    }

    it('should add a new hero to collection', () => {
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(hero);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 13], 'no new hero');
    });

    it('should error if new hero lacks its pkey', () => {
      const hero = { name: 'New One', power: 'Strong' };
      // bad add, no id.
      const action = createTestAction(<any> hero);
      const state = entityReducer(initialCache, action);
      expect(state).toBe(initialCache);
      expect(action.error.message)
        .toMatch(/payload is not an entity with a valid key/);
    });

    it('should NOT update an existing entity in collection', () => {
      const hero: Hero = { id: 2, name: 'B+' };
      const action = createTestAction(hero);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[2].name).toBe('B', 'same old name');
      // unmentioned property stays the same
      expect(collection.entities[2].power).toBe('Fast', 'power');
    });
  });

  describe('#UPDATE_MANY', () => {

    function createTestAction(heroes: Update<Hero>[])  {
      return createAction('Hero', EntityOp.UPDATE_MANY, heroes);
    }

    it('should not add new hero to collection', () => {
      const heroes: Hero[] = [{id: 3, name: 'New One'}];
      const updates = heroes.map(h => toHeroUpdate(h));
      const action = createTestAction(updates);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'no id:3');
    });

    it('should update existing entity in collection', () => {
      const heroes: Hero[] = [{id: 2, name: 'B+'}];
      const updates = heroes.map(h => toHeroUpdate(h));
      const action = createTestAction(updates);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[2].name).toBe('B+', 'name');
      // unmentioned property stays the same
      expect(collection.entities[2].power).toBe('Fast', 'power');
    });

    it('should update multiple existing entities in collection', () => {
      const heroes: Hero[] = [
        {id: 1, name: 'A+'},
        {id: 2, name: 'B+'},
        {id: 3, name: 'New One'},
      ];
      const updates = heroes.map(h => toHeroUpdate(h));
      const action = createTestAction(updates);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      // Did not add the 'New One'
      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[1].name).toBe('A+', 'name');
      expect(collection.entities[2].name).toBe('B+', 'name');
      expect(collection.entities[2].power).toBe('Fast', 'power');
    });

    it('can update existing entity\'s key in collection', () => {
      // Change the pkey (id) and the name of former hero:2
      const heroes: Hero[] = [{id: 42, name: 'Super'}];
      const updates = [{id: 2, changes: heroes[0]}];
      const action = createTestAction(updates);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([42, 1], 'ids are the same');
      expect(collection.entities[42].name).toBe('Super', 'name');
      // unmentioned property stays the same
      expect(collection.entities[42].power).toBe('Fast', 'power');
    });
  });

  describe('#UPDATE_ONE', () => {

    function createTestAction(hero: Update<Hero>)  {
      return createAction('Hero', EntityOp.UPDATE_ONE, hero);
    }

    it('should not add a new hero to collection', () => {
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(toHeroUpdate(hero));
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'no new hero');
    });

    it('should error if new hero lacks its pkey', () => {
      const hero = { name: 'New One', power: 'Strong' };
      // bad update: not an Update<T>
      const action = createTestAction(<any> hero);
      const state = entityReducer(initialCache, action);
      expect(state).toBe(initialCache);
      expect(action.error.message)
        .toMatch(/payload is not an Update<Hero> with a valid id/);
    });

    it('should update existing entity in collection', () => {
      const hero: Hero = { id: 2, name: 'B+' };
      const action = createTestAction(toHeroUpdate(hero));
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[2].name).toBe('B+', 'name');
      // unmentioned property stays the same
      expect(collection.entities[2].power).toBe('Fast', 'power');
    });

    it('can update existing entity\'s key in collection', () => {
      // Change the pkey (id) and the name of former hero:2
      const hero: Hero = { id: 42, name: 'Super' };
      const update = {id: 2, changes: hero };
      const action = createTestAction(update);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([42, 1], 'ids are the same');
      expect(collection.entities[42].name).toBe('Super', 'name');
      // unmentioned property stays the same
      expect(collection.entities[42].power).toBe('Fast', 'power');
    });
  });

  describe('#UPSERT_MANY', () => {

    function createTestAction(heroes: Update<Hero>[])  {
      return createAction('Hero', EntityOp.UPSERT_MANY, heroes);
    }

    it('should add new hero to collection', () => {
      const heroes: Hero[] = [{id: 13, name: 'New One', power: 'Strong'}];
      const updates = heroes.map(h => toHeroUpdate(h));
      const action = createTestAction(updates);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 13], 'new hero:13');
      expect(collection.entities[13].name).toBe('New One', 'name');
      expect(collection.entities[13].power).toBe('Strong', 'power');
    });

    it('should update existing entity in collection', () => {
      const heroes: Hero[] = [{id: 2, name: 'B+'}];
      const updates = heroes.map(h => toHeroUpdate(h));
      const action = createTestAction(updates);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[2].name).toBe('B+', 'name');
      // unmentioned property stays the same
      expect(collection.entities[2].power).toBe('Fast', 'power');
    });

    it('should update multiple existing entities in collection', () => {
      const heroes: Hero[] = [
        {id: 1, name: 'A+'},
        {id: 2, name: 'B+'},
        {id: 13, name: 'New One', power: 'Strong'},
      ];
      const updates = heroes.map(h => toHeroUpdate(h));
      const action = createTestAction(updates);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      // Did not add the 'New One'
      expect(collection.ids).toEqual([2, 1, 13], 'ids are the same');
      expect(collection.entities[1].name).toBe('A+', 'name');
      expect(collection.entities[2].name).toBe('B+', 'name');
      expect(collection.entities[2].power).toBe('Fast', 'power');
      expect(collection.entities[13].name).toBe('New One', 'name');
      expect(collection.entities[13].power).toBe('Strong', 'power');
    });

    it('can update existing entity\'s key in collection', () => {
      // Change the pkey (id) and the name of former hero:2
      const heroes: Hero[] = [{id: 42, name: 'Super'}];
      const updates = [{id: 2, changes: heroes[0]}];
      const action = createTestAction(updates);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([42, 1], 'ids are the same');
      expect(collection.entities[42].name).toBe('Super', 'name');
      // unmentioned property stays the same
      expect(collection.entities[42].power).toBe('Fast', 'power');
    });
  });

  describe('#UPSERT_ONE', () => {

    function createTestAction(hero: Update<Hero>)  {
      return createAction('Hero', EntityOp.UPSERT_ONE, hero);
    }

    it('should add new hero to collection', () => {
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(toHeroUpdate(hero));
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 13], 'new hero:13');
      expect(collection.entities[13].name).toBe('New One', 'name');
      expect(collection.entities[13].power).toBe('Strong', 'power');
    });

    it('should update existing entity in collection', () => {
      const hero: Hero = { id: 2, name: 'B+' };
      const action = createTestAction(toHeroUpdate(hero));
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[2].name).toBe('B+', 'name');
      // unmentioned property stays the same
      expect(collection.entities[2].power).toBe('Fast', 'power');
    });

    it('can update existing entity\'s key in collection', () => {
      // Change the pkey (id) and the name of former hero:2
      const hero: Hero = { id: 42, name: 'Super' };
      const update = {id: 2, changes: hero };
      const action = createTestAction(update);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([42, 1], 'ids are the same');
      expect(collection.entities[42].name).toBe('Super', 'name');
      // unmentioned property stays the same
      expect(collection.entities[42].power).toBe('Fast', 'power');
    });
  });

  describe('"Do nothing" save actions', () => {
    [
      EntityOp.SAVE_ADD_ONE,
      EntityOp.SAVE_ADD_ONE_ERROR,
      EntityOp.SAVE_ADD_ONE_OPTIMISTIC_ERROR
    ].forEach(op => testAddNoop(op));

    function testAddNoop(op: EntityOp) {
      const hero: Hero = { id: 2, name: 'B+' };
      const action = createAction('Hero', op, hero);

      it(`#${op} should do nothing to the collection`, () => {
        const state = entityReducer(initialCache, action);
        expect(state).toBe(initialCache);
        const collection = state['Hero'];
      });
    }

    [
      EntityOp.SAVE_DELETE_ONE,
      EntityOp.SAVE_DELETE_ONE_ERROR,
      EntityOp.SAVE_DELETE_ONE_OPTIMISTIC_SUCCESS,
      EntityOp.SAVE_DELETE_ONE_OPTIMISTIC_ERROR
    ].forEach(op => testDeleteNoop(op));

    function testDeleteNoop(op: EntityOp) {
      const action = createAction('Hero', op, 2);

      it(`#${op} should do nothing to the collection`, () => {
        const state = entityReducer(initialCache, action);
        expect(state).toBe(initialCache);
        const collection = state['Hero'];
      });
    }

    [
      EntityOp.SAVE_UPDATE_ONE,
      EntityOp.SAVE_UPDATE_ONE_ERROR,
      EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_SUCCESS,
      EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_ERROR
    ].forEach(op => testUpdateNoop(op));

    function testUpdateNoop(op: EntityOp) {
      const hero: Hero = { id: 2, name: 'B+' };
      // A data service like `DefaultDataService<T>` will add `unchanged:true`
      // if the server responded without data, meaning there is nothing to
      // update if already updated optimistically.
      const update: any =  { ...toHeroUpdate(hero), unchanged: true };
      const action = createAction('Hero', op, update);

      it(`#${op} should do nothing to the collection if unchanged flag is true`, () => {
        const state = entityReducer(initialCache, action);
        expect(state).toBe(initialCache);
        const collection = state['Hero'];
      });
    }
  });
  /** TODO: TEST REMAINING ACTIONS **/

  /***
   * Todo: test all other reducer actions
   * Not a high priority because these other EntityReducer methods delegate to the
   * @ngrx/entity EntityAdapter reducer methods which are presumed to be well tested.
   ***/

  describe('reducer override', () => {

    const queryAllAction = createAction('Hero', EntityOp.QUERY_ALL);

    beforeEach(() => {
      const eds = new EntityDefinitionService([metadata]);
      const def = eds.getDefinition<Hero>('Hero');
      const reducer = createReadOnlyHeroReducer(def.entityAdapter);
      // override regular Hero reducer
      entityReducerFactory.registerReducer('Hero', reducer);
    });

    // Make sure read-only reducer doesn't change QUERY_ALL behavior
    it('QUERY_ALL_SUCCESS clears loading flag and fills collection', () => {
      let state = entityReducer({}, queryAllAction);
      let collection = state['Hero'];
      expect(collection.loaded).toBe(false, 'should not be loaded at first');
      expect(collection.loading).toBe(true, 'should be loading at first');

      const heroes: Hero[] = [
        {id: 2, name: 'B'},
        {id: 1, name: 'A'},
      ];
      const action = createAction('Hero', EntityOp.QUERY_ALL_SUCCESS, heroes);
      state = entityReducer(state, action);
      collection = state['Hero'];
      expect(collection.ids).toEqual([2, 1], 'should have expected ids in load order');
      expect(collection.entities['1']).toBe(heroes[1], 'hero with id:1');
      expect(collection.entities['2']).toBe(heroes[0], 'hero with id:2');
      expect(collection.loaded).toBe(true, 'should be loaded ');
      expect(collection.loading).toBe(false, 'should not be loading');
    });

    it('QUERY_ALL_ERROR clears loading flag and does not fill collection', () => {
      let state = entityReducer({}, queryAllAction);
      const action = createAction('Hero', EntityOp.QUERY_ALL_ERROR);
      state = entityReducer(state, action);
      const collection = state['Hero'];
      expect(collection.loading).toBe(false, 'should not be loading');
      expect(collection.ids.length).toBe(0, 'should be empty collection');
    });

    it('QUERY_ALL_SUCCESS works for "Villain" entity with non-id primary key', () => {
      let state = entityReducer({}, queryAllAction);
      const villains: Villain[] = [
        {key: '2', name: 'B'},
        {key: '1', name: 'A'},
      ]
      const action = createAction('Villain', EntityOp.QUERY_ALL_SUCCESS, villains);
      state = entityReducer(state, action);
      const collection = state['Villain'];
      expect(collection.loading).toBe(false, 'should not be loading');
      expect(collection.ids).toEqual(['2', '1'], 'should have expected ids in load order');
      expect(collection.entities['1']).toBe(villains[1], 'villain with key:1');
      expect(collection.entities['2']).toBe(villains[0], 'villain with key:2');
    });

    it('QUERY_MANY is illegal for "Hero" collection', () => {
      const initialState = entityReducer({}, queryAllAction);

      const action = createAction('Hero', EntityOp.QUERY_MANY);
      const state = entityReducer(initialState, action);

      // Expect override reducer to throw error and for
      // EntityReducer to catch it and set the `EntityAction.error`
      expect(action.error.message).toMatch(/illegal operation for the "Hero" collection/);
      expect(state).toBe(initialState);
    });

    it('QUERY_MANY still works for "Villain" collection', () => {
      const action = createAction('Villain', EntityOp.QUERY_MANY);
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
            loaded: true,
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

