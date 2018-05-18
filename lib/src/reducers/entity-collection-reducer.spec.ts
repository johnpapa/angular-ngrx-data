import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';

import { EntityAction, EntityActionFactory } from '../actions/entity-action';
import { EntityOp } from '../actions/entity-op';
import { EntityCollection } from './entity-collection';

import { EntityCache } from './entity-cache';
import {
  MERGE_ENTITY_CACHE,
  SET_ENTITY_CACHE
} from '../actions/entity-cache-actions';
import { EntityCollectionCreator } from './entity-collection-creator';
import { DefaultEntityCollectionReducerMethodsFactory } from './default-entity-collection-reducer-methods';

import { EntityDefinitionService } from '../entity-metadata/entity-definition.service';
import { EntityMetadataMap } from '../entity-metadata/entity-metadata';
import { Logger } from '../utils/interfaces';
import { toUpdateFactory } from '../utils/utilities';
import { Dictionary, IdSelector, Update } from '../utils/ngrx-entity-models';

import {
  EntityCollectionReducer,
  EntityCollectionReducerFactory
} from './entity-collection-reducer';
import {
  EntityCollectionReducers,
  EntityReducerFactory
} from './entity-reducer';

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

describe('EntityCollectionReducer', () => {
  // action factory never changes in these tests
  const entityActionFactory = new EntityActionFactory();
  const createAction: (
    entityName: string,
    op: EntityOp,
    payload?: any
  ) => EntityAction = entityActionFactory.create.bind(entityActionFactory);

  const toHeroUpdate = toUpdateFactory<Hero>();

  let entityReducerFactory: EntityReducerFactory;
  let entityReducer: (state: EntityCache, action: Action) => EntityCache;

  let initialHeroes: Hero[];
  let initialCache: EntityCache;
  let logger: Logger;
  let collectionCreator: EntityCollectionCreator;

  beforeEach(() => {
    const eds = new EntityDefinitionService([metadata]);
    collectionCreator = new EntityCollectionCreator(eds);
    const collectionReducerMethodsFactory = new DefaultEntityCollectionReducerMethodsFactory(
      eds
    );
    const collectionReducerFactory = new EntityCollectionReducerFactory(
      collectionReducerMethodsFactory
    );
    logger = jasmine.createSpyObj('Logger', ['error', 'log', 'warn']);

    entityReducerFactory = new EntityReducerFactory(
      collectionCreator,
      collectionReducerFactory,
      logger
    );

    entityReducer = entityReducerFactory.create();

    initialHeroes = [
      { id: 2, name: 'B', power: 'Fast' },
      { id: 1, name: 'A', power: 'invisible' }
    ];
    initialCache = createInitialCache({ Hero: initialHeroes });
  });

  // Tests for EntityCache-level actions (e.g., SET_ENTITY_CACHE) are in `entity-reducer.spec.ts`

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
      const heroes: Hero[] = [{ id: 2, name: 'B' }, { id: 1, name: 'A' }];
      const action = createAction('Hero', EntityOp.QUERY_ALL_SUCCESS, heroes);
      state = entityReducer(state, action);
      const collection = state['Hero'];
      expect(collection.ids).toEqual(
        [2, 1],
        'should have expected ids in load order'
      );
      expect(collection.entities['1']).toBe(heroes[1], 'hero with id:1');
      expect(collection.entities['2']).toBe(heroes[0], 'hero with id:2');
      expect(collection.loaded).toBe(true, 'should be loaded');
      expect(collection.loading).toBe(false, 'should not be loading');
    });

    it('QUERY_ALL_SUCCESS replaces previous collection contents with new contents', () => {
      let state: EntityCache = {
        Hero: {
          ids: [42],
          entities: { 42: { id: 42, name: 'Fribit' } },
          filter: 'xxx',
          loaded: true,
          loading: false,
          originalValues: {}
        }
      };
      state = entityReducer(state, queryAction);
      const heroes: Hero[] = [{ id: 2, name: 'B' }, { id: 1, name: 'A' }];
      const action = createAction('Hero', EntityOp.QUERY_ALL_SUCCESS, heroes);
      state = entityReducer(state, action);
      const collection = state['Hero'];
      expect(collection.ids).toEqual(
        [2, 1],
        'should have expected ids in load order'
      );
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
        { key: '2', name: 'B' },
        { key: '1', name: 'A' }
      ];
      const action = createAction(
        'Villain',
        EntityOp.QUERY_ALL_SUCCESS,
        villains
      );
      state = entityReducer(state, action);
      const collection = state['Villain'];
      expect(collection.ids).toEqual(
        ['2', '1'],
        'should have expected ids in load order'
      );
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
      const hero: Hero = { id: 3, name: 'C' };
      const action = createAction('Hero', EntityOp.QUERY_BY_KEY_SUCCESS, hero);
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual(
        [3],
        'should have expected ids in load order'
      );
      expect(collection.loaded).toBe(false, 'should not be loaded');
      expect(collection.loading).toBe(false, 'should not be loading');
    });

    it('QUERY_BY_KEY_SUCCESS can add to existing collection', () => {
      let state = entityReducer(initialCache, queryAction);
      const hero: Hero = { id: 3, name: 'C' };
      const action = createAction('Hero', EntityOp.QUERY_BY_KEY_SUCCESS, hero);
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual(
        [2, 1, 3],
        'should have expected ids in load order'
      );
    });

    it('QUERY_BY_KEY_SUCCESS can update existing collection', () => {
      let state = entityReducer(initialCache, queryAction);
      const hero: Hero = { id: 1, name: 'A+' };
      const action = createAction('Hero', EntityOp.QUERY_BY_KEY_SUCCESS, hero);
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual(
        [2, 1],
        'should have expected ids in load order'
      );
      expect(collection.entities['1'].name).toBe('A+', 'should update hero:1');
    });

    // Normally would 404 but maybe this API just returns an empty result.
    it('QUERY_BY_KEY_SUCCESS works when the query results are empty', () => {
      let state = entityReducer(initialCache, queryAction);
      const action = createAction(
        'Hero',
        EntityOp.QUERY_BY_KEY_SUCCESS,
        undefined
      );
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.entities).toBe(
        initialCache['Hero'].entities,
        'collection.entities should be untouched'
      );
      expect(collection.ids).toBe(
        initialCache['Hero'].ids,
        'collection.entities should be untouched'
      );
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
      const heroes: Hero[] = [{ id: 3, name: 'C' }];
      const action = createAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual(
        [3],
        'should have expected ids in load order'
      );
      expect(collection.loaded).toBe(false, 'should not be loaded');
      expect(collection.loading).toBe(false, 'should not be loading');
    });

    it('QUERY_MANY_SUCCESS can add to existing collection', () => {
      let state = entityReducer(initialCache, queryAction);
      const heroes: Hero[] = [{ id: 3, name: 'C' }];
      const action = createAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual(
        [2, 1, 3],
        'should have expected ids in load order'
      );
    });

    it('QUERY_MANY_SUCCESS can update existing collection', () => {
      let state = entityReducer(initialCache, queryAction);
      const heroes: Hero[] = [{ id: 1, name: 'A+' }];
      const action = createAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual(
        [2, 1],
        'should have expected ids in load order'
      );
      expect(collection.entities['1'].name).toBe('A+', 'should update hero:1');
    });

    it('QUERY_MANY_SUCCESS can add and update existing collection', () => {
      let state = entityReducer(initialCache, queryAction);
      const heroes: Hero[] = [{ id: 3, name: 'C' }, { id: 1, name: 'A+' }];
      const action = createAction('Hero', EntityOp.QUERY_MANY_SUCCESS, heroes);
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual(
        [2, 1, 3],
        'should have expected ids in load order'
      );
      expect(collection.entities['1'].name).toBe('A+', 'should update hero:1');
    });

    it('QUERY_MANY_SUCCESS works when the query results are empty', () => {
      let state = entityReducer(initialCache, queryAction);
      const action = createAction('Hero', EntityOp.QUERY_MANY_SUCCESS, []);
      state = entityReducer(state, action);
      const collection = state['Hero'];

      expect(collection.entities).toBe(
        initialCache['Hero'].entities,
        'collection.entities should be untouched'
      );
      expect(collection.ids).toBe(
        initialCache['Hero'].ids,
        'collection.entities should be untouched'
      );
      expect(collection.ids).toEqual([2, 1], 'ids were not mutated');
      expect(collection).not.toBe(
        initialCache['Hero'],
        'collection changed by loading flag'
      );
    });
  });

  // Pessimistic SAVE_ADD_ONE operation should not touch the entities until success
  // See tests for this below

  describe('#SAVE_ADD_ONE_OPTIMISTIC', () => {
    function createTestAction(hero: Hero) {
      return createAction('Hero', EntityOp.SAVE_ADD_ONE_OPTIMISTIC, hero);
    }

    it('should add a new hero to collection', () => {
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(hero);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 13], 'should have new hero');
    });

    it('should error if new hero lacks its pkey', () => {
      const hero = { name: 'New One', power: 'Strong' };
      // bad add, no id.
      const action = createTestAction(<any>hero);
      const state = entityReducer(initialCache, action);
      expect(state).toBe(initialCache);
      expect(action.error.message).toMatch(/missing or invalid entity key/);
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

  describe('#SAVE_ADD_ONE_SUCCESS (Pessimistic)', () => {
    function createTestAction(hero: Hero) {
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
      const action = createTestAction(<any>hero);
      const state = entityReducer(initialCache, action);
      expect(state).toBe(initialCache);
      expect(action.error.message).toMatch(/missing or invalid entity key/);
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

  describe('#SAVE_ADD_ONE_OPTIMISTIC_SUCCESS', () => {
    function createTestAction(hero: Hero) {
      return createAction(
        'Hero',
        EntityOp.SAVE_ADD_ONE_OPTIMISTIC_SUCCESS,
        hero
      );
    }

    // The hero was already added to the collection by SAVE_ADD_ONE_OPTIMISTIC.
    it('should NOT add a new hero to collection', () => {
      // pretend this hero was added by SAVE_ADD_ONE_OPTIMISTIC and returned by server with changes
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(hero);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual(
        [2, 1],
        'should have same ids, no added hero'
      );
    });

    // The hero was already added to the collection by SAVE_ADD_ONE_OPTIMISTIC
    // You cannot change the key with SAVE_ADD_ONE_OPTIMISTIC_SUCCESS
    // You'd have to do it with SAVE_UPDATE_ONE...
    it('should NOT change the id of a newly added hero', () => {
      // pretend this hero was added by SAVE_ADD_ONE_OPTIMISTIC and returned by server with new ID
      const hero = initialHeroes[0];
      hero.id = 13;

      const action = createTestAction(hero);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'should have same ids');
    });

    it('should error if new hero lacks its pkey', () => {
      const hero = { name: 'New One', power: 'Strong' };
      // bad add, no id.
      const action = createTestAction(<any>hero);
      const state = entityReducer(initialCache, action);
      expect(state).toBe(initialCache);
      expect(action.error.message).toMatch(/missing or invalid entity key/);
    });

    // because the hero was already added to the collection by SAVE_ADD_ONE_OPTIMISTIC
    // should update values (but not id) if the server changed them
    // as it might with a concurrency property.
    it('should update an existing entity with that ID in collection', () => {
      // This example simulates the server updating the name and power
      const hero: Hero = { id: 2, name: 'Updated Name', power: 'Test Power' };
      const action = createTestAction(hero);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[2].name).toBe('Updated Name');
      // unmentioned property updated too
      expect(collection.entities[2].power).toBe('Test Power');
    });
  });

  // Pessimistic SAVE_DELETE_ONE operation should not remove the entity until success
  // See tests for this below

  describe('#SAVE_DELETE_ONE (Pessimistic)', () => {
    it('should NOT remove the hero with SAVE_DELETE_ONE', () => {
      const hero = initialHeroes[0];
      const action = createAction('Hero', EntityOp.SAVE_DELETE_ONE, hero);

      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];
      expect(collection.entities[hero.id]).toBe(hero, 'hero still there');
      expect(collection.loading).toBe(true, 'loading on');
    });

    it('should NOT remove the hero with SAVE_DELETE_ERROR', () => {
      const hero = initialHeroes[0];
      const action = createAction('Hero', EntityOp.SAVE_DELETE_ONE_ERROR, hero);

      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];
      expect(collection.entities[hero.id]).toBe(hero, 'hero still there');
      expect(collection.loading).toBe(false, 'loading off');
    });

    it('should remove the hero-by-id with SAVE_DELETE_ONE_SUCCESS', () => {
      const hero = initialHeroes[0];
      expect(initialCache['Hero'].entities[hero.id]).toBe(
        hero,
        'exists before delete'
      );

      const action = createAction(
        'Hero',
        EntityOp.SAVE_DELETE_ONE_SUCCESS,
        hero.id
      );

      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.entities[hero.id]).toBeUndefined('hero removed');
      expect(collection.loading).toBe(false, 'loading off');
    });

    it('should remove the hero with SAVE_DELETE_ONE_SUCCESS', () => {
      const hero = initialHeroes[0];
      expect(initialCache['Hero'].entities[hero.id]).toBe(
        hero,
        'exists before delete'
      );

      const action = createAction(
        'Hero',
        EntityOp.SAVE_DELETE_ONE_SUCCESS,
        hero
      );

      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.entities[hero.id]).toBeUndefined('hero removed');
      expect(collection.loading).toBe(false, 'loading off');
    });
  });

  // Optimistic SAVE_DELETE_ONE_OPTIMISTIC operation should remove the entity immediately
  // See tests for this below
  describe('#SAVE_DELETE_ONE_OPTIMISTIC', () => {
    it('should remove the hero immediately with SAVE_DELETE_ONE_OPTIMISTIC', () => {
      const hero = initialHeroes[0];
      expect(initialCache['Hero'].entities[hero.id]).toBe(
        hero,
        'exists before delete'
      );

      const action = createAction(
        'Hero',
        EntityOp.SAVE_DELETE_ONE_OPTIMISTIC,
        hero
      );

      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.entities[hero.id]).toBeUndefined('hero removed');
      expect(collection.loading).toBe(true, 'loading on');
    });

    it('should remove the hero-by-id immediately with SAVE_DELETE_ONE_OPTIMISTIC', () => {
      const hero = initialHeroes[0];
      expect(initialCache['Hero'].entities[hero.id]).toBe(
        hero,
        'exists before delete'
      );

      const action = createAction(
        'Hero',
        EntityOp.SAVE_DELETE_ONE_OPTIMISTIC,
        hero.id
      );

      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.entities[hero.id]).toBeUndefined('hero removed');
      expect(collection.loading).toBe(true, 'loading on');
    });

    // No compensating action on error (yet)
    it('should NOT restore the hero with SAVE_DELETE_ONE_OPTIMISTIC_ERROR', () => {
      const initialEntities = initialCache['Hero'].entities;
      const action = createAction(
        'Hero',
        EntityOp.SAVE_DELETE_ONE_ERROR,
        { id: 13, name: 'Deleted' } // Pretend optimistically deleted this hero
      );

      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];
      expect(collection.entities).toBe(initialEntities, 'entities untouched');
      expect(collection.loading).toBe(false, 'loading off');
    });

    it('should only turn loading flag off with SAVE_DELETE_ONE_OPTIMISTIC_SUCCESS', () => {
      const initialEntities = initialCache['Hero'].entities;
      const action = createAction(
        'Hero',
        EntityOp.SAVE_DELETE_ONE_SUCCESS,
        { id: 13, name: 'Deleted' } // Pretend optimistically deleted this hero
      );

      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];
      expect(collection.entities).toBe(initialEntities, 'entities untouched');
      expect(collection.loading).toBe(false, 'loading off');
    });
  });

  // Pessimistic SAVE_UPDATE_ONE operation should not touch the entities until success
  // See tests for this below

  describe('#SAVE_UPDATE_ONE_OPTIMISTIC', () => {
    function createTestAction(hero: Update<Hero>) {
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

    it('can update existing entity key in collection', () => {
      // Change the pkey (id) and the name of former hero:2
      const hero: Hero = { id: 42, name: 'Super' };
      const update = { id: 2, changes: hero };
      const action = createTestAction(update);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([42, 1], 'ids are the same');
      expect(collection.entities[42].name).toBe('Super', 'name');
      // unmentioned property stays the same
      expect(collection.entities[42].power).toBe('Fast', 'power');
    });

    // Changed in v6. It used to add a new entity.
    it('should NOT add new hero to collection', () => {
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(toHeroUpdate(hero));
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'no new hero:13');
    });
  });

  describe('#SAVE_UPDATE_ONE_SUCCESS (Pessimistic)', () => {
    function createTestAction(hero: Update<Hero>) {
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

    it('can update existing entity key in collection', () => {
      // Change the pkey (id) and the name of former hero:2
      const hero: Hero = { id: 42, name: 'Super' };
      const update = { id: 2, changes: hero };
      const action = createTestAction(update);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([42, 1], 'ids are the same');
      expect(collection.entities[42].name).toBe('Super', 'name');
      // unmentioned property stays the same
      expect(collection.entities[42].power).toBe('Fast', 'power');
    });

    // Changed in v6. It used to add a new entity.
    it('should add new hero to collection', () => {
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(toHeroUpdate(hero));
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'no new hero:13');
    });
  });

  describe('#SAVE_UPDATE_ONE_OPTIMISTIC_SUCCESS', () => {
    function createTestAction(hero: Update<Hero>) {
      return createAction(
        'Hero',
        EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_SUCCESS,
        hero
      );
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

    it('can update existing entity key in collection', () => {
      // Change the pkey (id) and the name of former hero:2
      const hero: Hero = { id: 42, name: 'Super' };
      const update = { id: 2, changes: hero };
      const action = createTestAction(update);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([42, 1], 'ids are the same');
      expect(collection.entities[42].name).toBe('Super', 'name');
      // unmentioned property stays the same
      expect(collection.entities[42].power).toBe('Fast', 'power');
    });

    // Changed in v6. It used to add a new entity.
    it('should add new hero to collection', () => {
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(toHeroUpdate(hero));
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'no new hero:13');
    });
  });

  describe('#ADD_ONE', () => {
    function createTestAction(hero: Hero) {
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
      const action = createTestAction(<any>hero);
      const state = entityReducer(initialCache, action);
      expect(state).toBe(initialCache);
      expect(action.error.message).toMatch(/missing or invalid entity key/);
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
    function createTestAction(heroes: Update<Hero>[]) {
      return createAction('Hero', EntityOp.UPDATE_MANY, heroes);
    }

    it('should not add new hero to collection', () => {
      const heroes: Hero[] = [{ id: 3, name: 'New One' }];
      const updates = heroes.map(h => toHeroUpdate(h));
      const action = createTestAction(updates);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'no id:3');
    });

    it('should update existing entity in collection', () => {
      const heroes: Hero[] = [{ id: 2, name: 'B+' }];
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
        { id: 1, name: 'A+' },
        { id: 2, name: 'B+' },
        { id: 3, name: 'New One' }
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

    it('can update existing entity key in collection', () => {
      // Change the pkey (id) and the name of former hero:2
      const heroes: Hero[] = [{ id: 42, name: 'Super' }];
      const updates = [{ id: 2, changes: heroes[0] }];
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
    function createTestAction(hero: Update<Hero>) {
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
      const action = createTestAction(<any>hero);
      const state = entityReducer(initialCache, action);
      expect(state).toBe(initialCache);
      expect(action.error.message).toMatch(/missing or invalid entity key/);
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

    it('can update existing entity key in collection', () => {
      // Change the pkey (id) and the name of former hero:2
      const hero: Hero = { id: 42, name: 'Super' };
      const update = { id: 2, changes: hero };
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
    function createTestAction(heroes: Hero[]) {
      return createAction('Hero', EntityOp.UPSERT_MANY, heroes);
    }

    it('should add new hero to collection', () => {
      const updates: Hero[] = [{ id: 13, name: 'New One', power: 'Strong' }];
      const action = createTestAction(updates);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 13], 'new hero:13');
      expect(collection.entities[13].name).toBe('New One', 'name');
      expect(collection.entities[13].power).toBe('Strong', 'power');
    });

    it('should update existing entity in collection', () => {
      const updates: Hero[] = [{ id: 2, name: 'B+' }];
      const action = createTestAction(updates);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[2].name).toBe('B+', 'name');
      // unmentioned property stays the same
      expect(collection.entities[2].power).toBe('Fast', 'power');
    });

    it('should update multiple existing entities in collection', () => {
      const updates: Hero[] = [
        { id: 1, name: 'A+' },
        { id: 2, name: 'B+' },
        { id: 13, name: 'New One', power: 'Strong' }
      ];
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
  });

  describe('#UPSERT_ONE', () => {
    function createTestAction(hero: Hero) {
      return createAction('Hero', EntityOp.UPSERT_ONE, hero);
    }

    it('should add new hero to collection', () => {
      const hero: Hero = { id: 13, name: 'New One', power: 'Strong' };
      const action = createTestAction(hero);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1, 13], 'new hero:13');
      expect(collection.entities[13].name).toBe('New One', 'name');
      expect(collection.entities[13].power).toBe('Strong', 'power');
    });

    it('should update existing entity in collection', () => {
      const hero: Hero = { id: 2, name: 'B+' };
      const action = createTestAction(hero);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.ids).toEqual([2, 1], 'ids are the same');
      expect(collection.entities[2].name).toBe('B+', 'name');
      // unmentioned property stays the same
      expect(collection.entities[2].power).toBe('Fast', 'power');
    });
  });

  describe('SET FLAGS', () => {
    it('should set filter value with SET_FILTER', () => {
      const action = createAction(
        'Hero',
        EntityOp.SET_FILTER,
        'test filter value'
      );
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.filter).toEqual('test filter value');
    });

    it('should set loaded flag with SET_LOADED', () => {
      const beforeLoaded = initialCache['Hero'].loaded;
      const expectedLoaded = !beforeLoaded;
      const action = createAction('Hero', EntityOp.SET_LOADED, expectedLoaded);
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.loaded).toEqual(expectedLoaded, 'loaded flag');
    });

    it('should set loading flag with SET_LOADING', () => {
      const beforeLoading = initialCache['Hero'].loading;
      const expectedLoading = !beforeLoading;
      const action = createAction(
        'Hero',
        EntityOp.SET_LOADING,
        expectedLoading
      );
      const state = entityReducer(initialCache, action);
      const collection = state['Hero'];

      expect(collection.loading).toEqual(expectedLoading, 'loading flag');
    });
  });

  describe('"Do nothing" save actions', () => {
    describe('ADD', () => {
      [
        EntityOp.SAVE_ADD_ONE,
        EntityOp.SAVE_ADD_ONE_ERROR,
        EntityOp.SAVE_ADD_ONE_OPTIMISTIC_ERROR // no compensation
      ].forEach(op => testAddNoop(op));

      function testAddNoop(op: EntityOp) {
        const hero: Hero = { id: 2, name: 'B+' };
        const action = createAction('Hero', op, hero);
        shouldOnlySetLoadingFlag(action);
      }
    });

    describe('DELETE', () => {
      [
        EntityOp.SAVE_DELETE_ONE,
        EntityOp.SAVE_DELETE_ONE_ERROR,
        EntityOp.SAVE_DELETE_ONE_OPTIMISTIC_SUCCESS,
        EntityOp.SAVE_DELETE_ONE_OPTIMISTIC_ERROR // no compensation
      ].forEach(op => testDeleteNoop(op));

      function testDeleteNoop(op: EntityOp) {
        const action = createAction('Hero', op, 2);
        shouldOnlySetLoadingFlag(action);
      }
    });

    describe('UPDATE (when HTTP update returned nothing)', () => {
      [
        EntityOp.SAVE_UPDATE_ONE,
        EntityOp.SAVE_UPDATE_ONE_ERROR,
        EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_SUCCESS,
        EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_ERROR // no compensation
      ].forEach(op => testUpdateNoop(op));

      function testUpdateNoop(op: EntityOp) {
        const hero: Hero = { id: 2, name: 'B+' };
        // A data service like `DefaultDataService<T>` will add `unchanged:true`
        // if the server responded without data, meaning there is nothing to
        // update if already updated optimistically.
        const update: any = { ...toHeroUpdate(hero), unchanged: true };
        const action = createAction('Hero', op, update);
        shouldOnlySetLoadingFlag(action);
      }
    });

    function shouldOnlySetLoadingFlag(action: EntityAction) {
      const expectedLoadingFlag = !/error|success/i.test(action.op);

      it(`#${
        action.op
      } should only set loading to ${expectedLoadingFlag}`, () => {
        // Flag should be true when op starts, false after error or success
        const initialCollection = initialCache['Hero'];
        const newCollection = entityReducer(initialCache, action)['Hero'];
        expect(newCollection.loading).toBe(expectedLoadingFlag, 'loading flag');
        expect({
          ...newCollection,
          loading: initialCollection.loading // revert flag for test
        }).toEqual(initialCollection);
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

      const heroes: Hero[] = [{ id: 2, name: 'B' }, { id: 1, name: 'A' }];
      const action = createAction('Hero', EntityOp.QUERY_ALL_SUCCESS, heroes);
      state = entityReducer(state, action);
      collection = state['Hero'];
      expect(collection.ids).toEqual(
        [2, 1],
        'should have expected ids in load order'
      );
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
        { key: '2', name: 'B' },
        { key: '1', name: 'A' }
      ];
      const action = createAction(
        'Villain',
        EntityOp.QUERY_ALL_SUCCESS,
        villains
      );
      state = entityReducer(state, action);
      const collection = state['Villain'];
      expect(collection.loading).toBe(false, 'should not be loading');
      expect(collection.ids).toEqual(
        ['2', '1'],
        'should have expected ids in load order'
      );
      expect(collection.entities['1']).toBe(villains[1], 'villain with key:1');
      expect(collection.entities['2']).toBe(villains[0], 'villain with key:2');
    });

    it('QUERY_MANY is illegal for "Hero" collection', () => {
      const initialState = entityReducer({}, queryAllAction);

      const action = createAction('Hero', EntityOp.QUERY_MANY);
      const state = entityReducer(initialState, action);

      // Expect override reducer to throw error and for
      // EntityReducer to catch it and set the `EntityAction.error`
      expect(action.error.message).toMatch(
        /illegal operation for the "Hero" collection/
      );
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
      return function heroReducer(
        collection: EntityCollection<Hero>,
        action: EntityAction
      ): EntityCollection<Hero> {
        switch (action.op) {
          case EntityOp.QUERY_ALL:
            return collection.loading
              ? collection
              : { ...collection, loading: true };

          case EntityOp.QUERY_ALL_SUCCESS:
            return {
              ...adapter.addAll(action.payload, collection),
              loaded: true,
              loading: false
            };

          case EntityOp.QUERY_ALL_ERROR: {
            return collection.loading
              ? { ...collection, loading: false }
              : collection;
          }

          default:
            throw new Error(
              `${action.op} is an illegal operation for the "Hero" collection`
            );
        }
      };
    }
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
  // #endregion helpers
});
