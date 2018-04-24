import { Selector } from '@ngrx/store';

import { EntityCache } from '../reducers/entity-cache';
import { ENTITY_CACHE_NAME } from '../reducers/constants';
import { EntityCollection, createEmptyEntityCollection } from '../reducers';
import {
  EntityMetadata,
  EntityMetadataMap,
  PropsFilterFnFactory
} from '../entity-metadata';

import { EntitySelectors, EntitySelectorsFactory } from './entity-selectors';

describe('EntitySelectors', () => {
  /** HeroMetadata identifies the extra collection state properties */
  const heroMetadata: EntityMetadata<Hero> = {
    entityName: 'Hero',
    filterFn: nameFilter,
    additionalCollectionState: {
      foo: 'Foo',
      bar: 3.14
    }
  };

  const villainMetadata: EntityMetadata<Villain> = {
    entityName: 'Villain',
    selectId: (entity: Villain) => entity.key
  };

  let collectionCreator: any;
  let entitySelectorsFactory: EntitySelectorsFactory;

  beforeEach(() => {
    collectionCreator = jasmine.createSpyObj('entityCollectionCreator', [
      'create'
    ]);
    entitySelectorsFactory = new EntitySelectorsFactory(
      ENTITY_CACHE_NAME,
      collectionCreator
    );
  });

  describe('#createCollectionSelector', () => {
    const initialState = createHeroState({
      ids: [1],
      entities: { 1: { id: 1, name: 'A' } },
      foo: 'foo foo',
      bar: 42
    });

    it('creates collection selector that defaults to initial state', () => {
      collectionCreator.create.and.returnValue(initialState);
      const selectors = entitySelectorsFactory.createCollectionSelector<
        Hero,
        HeroCollection
      >('Hero');
      const state = { entityCache: {} }; // ngrx store with empty cache
      const collection = selectors(state);
      expect(collection.entities).toEqual(initialState.entities, 'entities');
      expect(collection.foo).toEqual('foo foo', 'foo');
      expect(collectionCreator.create).toHaveBeenCalled();
    });

    it('collection selector should return cached collection when it exists', () => {
      // must specify type-args when initialState isn't available for type inference
      const selectors = entitySelectorsFactory.createCollectionSelector<
        Hero,
        HeroCollection
      >('Hero');

      // ngrx store with populated Hero collection
      const state = {
        entityCache: {
          Hero: {
            ids: [42],
            entities: { 42: { id: 42, name: 'The Answer' } },
            filter: '',
            loading: true,
            foo: 'towel',
            bar: 0
          }
        }
      };

      const collection = selectors(state);
      expect(collection.entities[42]).toEqual(
        { id: 42, name: 'The Answer' },
        'entities'
      );
      expect(collection.foo).toBe('towel', 'foo');
      expect(collectionCreator.create).not.toHaveBeenCalled();
    });
  });

  describe('#createEntitySelectors', () => {
    it('should have expected Hero selectors (a super-set of EntitySelectors)', () => {
      const collection = <HeroCollection>(<any>{
        ids: [42],
        entities: { 42: { id: 42, name: 'A' } },
        filter: 'B',
        foo: 'Foo'
      });
      const store = { entityCache: { Hero: collection } };

      const selectors = entitySelectorsFactory.create<Hero, HeroSelectors>(
        heroMetadata
      );

      expect(selectors.selectEntities).toBeDefined('selectAll');
      expect(selectors.selectEntities(store)).toEqual(
        [{ id: 42, name: 'A' }],
        'try selectAll'
      );

      expect(selectors.selectFilteredEntities(store)).toEqual(
        [],
        'no matching heroes'
      );

      expect(selectors.selectFoo).toBeDefined('selectFoo');
      expect(selectors.selectFoo(store)).toBe('Foo', 'try selectFoo');
    });

    it('should have expected Villain selectors', () => {
      const collection = <EntityCollection<Villain>>(<any>{
        ids: [24],
        entities: { 24: { key: 'evil', name: 'A' } },
        filter: 'B' // doesn't matter because no filter function
      });
      const store = { entityCache: { Villain: collection } };

      const selectors = entitySelectorsFactory.create<Villain>(villainMetadata);
      const expectedEntities: Villain[] = [{ key: 'evil', name: 'A' }];

      expect(selectors.selectEntities).toBeDefined('selectAll');
      expect(selectors.selectEntities(store)).toEqual(
        expectedEntities,
        'try selectAll'
      );

      expect(selectors.selectFilteredEntities(store)).toEqual(
        expectedEntities,
        'all villains because no filter fn'
      );
    });
  });
});

/////// Test values and helpers /////////

function createHeroState(state: Partial<HeroCollection>): HeroCollection {
  return { ...createEmptyEntityCollection<Hero>(), ...state } as HeroCollection;
}

function nameFilter<T>(entities: T[], pattern: string) {
  return PropsFilterFnFactory<any>(['name'])(entities, pattern);
}

/// Hero
interface Hero {
  id: number;
  name: string;
}

/** HeroCollection is EntityCollection<Hero> with extra collection properties */
interface HeroCollection extends EntityCollection<Hero> {
  foo: string;
  bar: number;
}

/** HeroSelectors identifies the extra selectors for the extra collection properties */
interface HeroSelectors extends EntitySelectors<Hero> {
  selectFoo: Selector<Object, string>;
  selectBar: Selector<Object, number>;
}

/// Villain
interface Villain {
  key: string;
  name: string;
}
