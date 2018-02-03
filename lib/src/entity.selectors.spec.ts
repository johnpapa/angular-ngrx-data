import { createFeatureSelector, createSelector, Selector, Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { EntityCache, ENTITY_CACHE_NAME } from './interfaces';
import { EntityCollection } from './entity-definition';
import { EntityMetadata, EntityMetadataMap } from './entity-metadata';
import { PropsFilterFnFactory } from './entity-filters';

import {
  createCachedCollectionSelector,
  createEntitySelectors,
  createEntitySelectors$,
  EntitySelectors,
  EntitySelectors$
} from './entity.selectors';

/////// Test values and helpers /////////

const entityCacheSelector = createFeatureSelector<EntityCache>(ENTITY_CACHE_NAME);

export function nameFilter<T>(entities: T[], pattern: string) {
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

/** HeroMetadata identifies the extra collection state properties */
const heroMetadata: EntityMetadata<Hero> = {
  entityName: 'Hero',
  filterFn: nameFilter,
  additionalCollectionState: {
    foo: 'Foo',
    bar: 3.14
  }
};

/** HeroSelectors identifies the extra selectors for the extra collection properties */
interface HeroSelectors extends EntitySelectors<Hero> {
  selectFoo: Selector<HeroCollection, string>;
  selectBar: Selector<HeroCollection, number>;
}

/** HeroSelectors identifies the extra selectors for the extra collection properties */
interface HeroSelectors$ extends EntitySelectors$<Hero> {
  selectFoo$: Observable<string> | Store<string>;
  selectBar$: Observable<number> | Store<number>;
}

/// Villain
interface Villain {
  key: string;
  name: string;
}

const villainMetadata: EntityMetadata<Villain> = {
  entityName: 'Villain',
  selectId: (entity: Villain) => entity.key
}

/////// Tests ///////
describe('Entity Selectors', () => {

  describe('#createCachedCollectionSelector', () => {

    const initialState: HeroCollection = {
      ids: [1],
      entities: {1: {id: 1, name: 'A'}},
      filter: '',
      loading: false,
      foo: 'foo foo',
      bar: 42
    };

    it('creates collection selector that defaults to initial state', () => {
      const selector = createCachedCollectionSelector(
        'Hero', entityCacheSelector, initialState);
      const state = { entityCache: {} }; // ngrx store with empty cache
      const collection = selector(state)
      expect(collection.entities).toEqual(initialState.entities, 'entities');
      expect(collection.foo).toEqual('foo foo', 'foo');
    });

    it('creates collection selector that defaults to the default initial state', () => {
      // must specify type-args when initialState isn't available for type inference
      const selector = createCachedCollectionSelector<Hero, HeroCollection>(
        'Hero', entityCacheSelector);
      const state = { entityCache: {} }; // ngrx store with empty cache
      const collection = selector(state)
      expect(collection.entities).toEqual({}, 'entities');
      expect(collection.foo).toBeUndefined('foo');
    });

    it('collection selector should return cached collection when it exists', () => {
      // must specify type-args when initialState isn't available for type inference
      const selector = createCachedCollectionSelector<Hero, HeroCollection>(
        'Hero', entityCacheSelector);

      // ngrx store with populated Hero collection
      const state = {
        entityCache: {
          Hero: {
            ids: [42],
            entities: {42: {id: 42, name: 'The Answer'}},
            filter: '',
            loading: true,
            foo: 'towel',
            bar: 0
          }
        }
      };

      const collection = selector(state)
      expect(collection.entities[42]).toEqual({id: 42, name: 'The Answer'}, 'entities');
      expect(collection.foo).toBe('towel', 'foo');
    });
  });

  describe('#createEntitySelectors', () => {

    it('should have expected Hero selectors (a super-set of EntitySelectors)', () => {
      const collection = <HeroCollection> <any> {
        ids: [42],
        entities: {42: {id: 42, name: 'A'}},
        filter: 'B',
        foo: 'Foo'
      };
      const selectors = createEntitySelectors<Hero, HeroSelectors>(heroMetadata);

      expect(selectors.selectAll).toBeDefined('selectAll');
      expect(selectors.selectAll(collection)).toEqual([{id: 42, name: 'A'}], 'try selectAll');

      expect(selectors.selectFilteredEntities(collection)).toEqual([], 'no matching heroes');

      expect(selectors.selectFoo).toBeDefined('selectFoo');
      expect(selectors.selectFoo(collection)).toBe('Foo', 'try selectFoo')
    });

    it('should have expected Villain selectors', () => {
      const collection = <EntityCollection<Villain>> <any> {
        ids: [24],
        entities: {24: {key: 'evil', name: 'A'}},
        filter: 'B' // doesn't matter because no filter function
      };
      const selectors = createEntitySelectors(villainMetadata);
      const expectedEntities = [{key: 'evil', name: 'A'}];

      expect(selectors.selectAll).toBeDefined('selectAll');
      expect(selectors.selectAll(collection)).toEqual(expectedEntities, 'try selectAll');

      expect(selectors.selectFilteredEntities(collection)).toEqual(expectedEntities,
        'all villains because no filter fn');
    });
  });

  // Hero has a super-set of EntitySelectors$
  describe('#createEntitySelectors$ (Hero)', () => {
    // The store during tests will be the entity cache
    let store: Store<EntityCache>;

    // Therefore, the cache selector returns the store itself
    const cacheSelector = (s: EntityCache) => s;

    // Selectors don't change during tests
    const selectors = createEntitySelectors<Hero, HeroSelectors>(heroMetadata);

    // Some immutable cache states
    const emptyCache: EntityCache = {};
    const initializedHeroCache: EntityCache = <any> {
      // The state of the HeroCollection in this test suite as the EntityReducer might initialize it.
      Hero: {ids: [], entities: {}, loading: false, filter: undefined, bar: 3.14 }
    };

    let bar: number;
    let collection: HeroCollection;
    let foo: string;
    let heroes: Hero[];
    let loading: boolean;

    // Observable of state changes, which these tests simulate
    let state$: BehaviorSubject<EntityCache>;

    beforeEach(() => {
      state$ = new BehaviorSubject(emptyCache);
      store = new Store<EntityCache>(state$, null, null);

      // listen for changes to the hero collection
      store.select('Hero').subscribe((c: HeroCollection) => collection = c);
    });

    function subscribeToSelectors(selectors$: HeroSelectors$) {
      selectors$.selectAll$.subscribe(h => heroes = h);
      selectors$.selectLoading$.subscribe(l => loading = l);
      selectors$.selectFoo$.subscribe(f => foo = f);
      selectors$.selectBar$.subscribe(b => bar = b);
    }

    it('selectors$ emit default empty values when collection is undefined', () => {
      const selectors$ = createEntitySelectors$<Hero, HeroSelectors$>(
        'Hero', store, cacheSelector, selectors);

      subscribeToSelectors(selectors$);

      expect(heroes).toEqual([], 'no heroes by default');
      expect(loading).toBe(false, 'loading is false by default');
      expect(foo).toBeUndefined('no default foo value');
      expect(bar).toBeUndefined('no default bar value');
    });

    it('selectors$ emit expected values for initialized Hero collection', () => {
      const selectors$ = createEntitySelectors$<Hero, HeroSelectors$>(
        'Hero', store, cacheSelector, selectors);

      subscribeToSelectors(selectors$);

      // prime the store for Hero first use as the EntityReducer would
      state$.next(initializedHeroCache);

      expect(heroes).toEqual([], 'no heroes when collection initialized');
      expect(foo).toBeUndefined('no foo when collection initialized');
      expect(bar).toEqual(3.14, 'bar has initial value');
    });

    it('selectors$ emit updated hero values', () => {
      const selectors$ = createEntitySelectors$<Hero, HeroSelectors$>(
        'Hero', store, cacheSelector, selectors);

      subscribeToSelectors(selectors$);

      // prime the store for Hero first use as the EntityReducer would
      state$.next(initializedHeroCache);

      // set foo and add an entity as the reducer would
      collection = {
        ...collection,
        ...{
          foo: 'FooDoo',
          ids: [42],
          entities: {42: {id: 42, name: 'Bob'}}
        }
      };

      // update the store as a reducer would
      state$.next({ ...emptyCache, Hero: collection});

      // Selectors$ should have emitted the updated values.
      expect(heroes).toEqual([{id: 42, name: 'Bob'}], 'added a hero');
      expect(loading).toBe(false, 'loading'); // didn't change
      expect(foo).toEqual('FooDoo', 'updated foo value');
      expect(bar).toEqual(3.14, 'still the initial value'); // didn't change
    });

    it('selectors$ emit supplied defaultCollectionState when collection is undefined', () => {

      // N.B. This is an absurd default state, suitable for test purposes only.
      // The default state feature exists to prevent selectors$ subscriptions
      // from bombing before the collection is initialized or
      // during time-travel debugging.
      const defaultHeroState: HeroCollection = {
        ids: [1],
        entities: {1: {id: 1, name: 'A'}},
        filter: '',
        loading: false,
        foo: 'foo foo',
        bar: 42
      };

      const selectors$ = createEntitySelectors$<Hero, HeroSelectors$>(
        'Hero', store, cacheSelector, selectors, defaultHeroState); // <- override default state

      subscribeToSelectors(selectors$);

      expect(heroes).toEqual([{id: 1, name: 'A'}], 'default state heroes');
      expect(foo).toEqual('foo foo', 'has default foo');
      expect(bar).toEqual(42, 'has default bar');

      // Important: the selector is returning these values;
      // They are not actually in the store's entity cache collection!
      expect(collection).toBeUndefined( 'no collection until reducer creates it.');
    });
  });

});
