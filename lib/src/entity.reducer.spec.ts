import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';

import { EntityAction, EntityActionFactory, EntityOp } from './entity.actions';
import { EntityCache } from './interfaces';
import { EntityDefinitionService } from './entity-definition.service';
import { EntityMetadataMap } from './entity-metadata';
import { Update } from './ngrx-entity-models';

import { EntityCollection } from './entity-definition';
import { EntityCollectionCreator } from './entity-collection-creator';
import { EntityCollectionReducer, EntityCollectionReducerFactory } from './entity-collection.reducer';
import { EntityCollectionReducers, EntityReducerFactory } from './entity.reducer';

export class Bar { id: number; bar: string; }
export class Foo { id: string; foo: string; }
export class Hero { id: number; name: string; }
export class Villain { key: string; name: string; }

const metadata: EntityMetadataMap = {
  Hero: {entityName: 'Hero'},
  Villain: {entityName: 'Villain', selectId: (villain: Villain) => villain.key },
}

describe('EntityReducer', () => {
  // action factory never changes in these tests
  const entityActionFactory = new EntityActionFactory();
  let entityReducerFactory: EntityReducerFactory;
  let entityReducer: (state: EntityCache, action: EntityAction) => EntityCache;

  beforeEach(() => {
    const eds = new EntityDefinitionService([metadata]);
    const collectionCreator = new EntityCollectionCreator(eds);
    const collectionReducerFactory = new EntityCollectionReducerFactory();

    entityReducerFactory = new EntityReducerFactory(
      eds, collectionCreator, collectionReducerFactory);

    entityReducer = entityReducerFactory.create();
  });

  describe('#create', () => {
    it('creates a default hero reducer when QUERY_ALL for hero', () => {
      const hero: Hero = { id: 42, name: 'Bobby'};
      const action = entityActionFactory.create<Hero>('Hero', EntityOp.ADD_ONE, hero);

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

  describe('#registerReducers', () => {
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
});

function createNoopReducer<T>() {
  return function NoopReducer(collection: EntityCollection<T>, action: EntityAction): EntityCollection<T> {
   return collection;
  }
}
