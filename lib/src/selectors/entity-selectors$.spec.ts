import { Action, createFeatureSelector, createSelector, Selector, Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { EntityAction, EntityActions, EntityActionFactory, EntityOp } from '../actions';
import { EntityCache, EntityCollection } from '../reducers';
import { EntityCollectionCreator, createEmptyEntityCollection } from '../reducers';
import { EntityMetadata, EntityMetadataMap } from '../entity-metadata';
import { PropsFilterFnFactory } from '../entity-metadata';
import { createEntitySelectors, EntitySelectors } from './entity-selectors';

import {
  createCachedCollectionSelector,
  EntitySelectors$,
  EntitySelectors$Factory
} from './entity-selectors$';

describe('EntitySelectors$', () => {

  /** HeroMetadata identifies extra collection state properties */
  const heroMetadata: EntityMetadata<Hero> = {
    entityName: 'Hero',
    filterFn: nameFilter,
    additionalCollectionState: {
      foo: 'Foo',
      bar: 3.14
    }
  };

  /** As entityAdapter.initialState would create it */
  const emptyHeroCollection = createHeroState({ foo: 'foo', bar: 3.14 })

  const villainMetadata: EntityMetadata<Villain> = {
    entityName: 'Villain',
    selectId: (entity: Villain) => entity.key
  }

  describe('createCachedCollectionSelector', () => {

    let collectionCreator: any;

    const entityCacheSelector = createFeatureSelector<EntityCache>('entityCache');

    const initialState = createHeroState({
      ids: [1],
      entities: {1: {id: 1, name: 'A'}},
      foo: 'foo foo',
      bar: 42
    })

    beforeEach(() => {
      collectionCreator  = jasmine.createSpyObj('entityCollectionCreator', ['create']);
    });

    it('creates collection selector that defaults to initial state', () => {
      collectionCreator.create.and.returnValue(initialState);
      const selector = createCachedCollectionSelector<Hero, HeroCollection>(
        'Hero', entityCacheSelector, collectionCreator);
      const state = { entityCache: {} }; // ngrx store with empty cache
      const collection = selector(state)
      expect(collection.entities).toEqual(initialState.entities, 'entities');
      expect(collection.foo).toEqual('foo foo', 'foo');
      expect(collectionCreator.create).toHaveBeenCalled();
    });

    it('collection selector should return cached collection when it exists', () => {
      // must specify type-args when initialState isn't available for type inference
      const selector = createCachedCollectionSelector<Hero, HeroCollection>(
        'Hero', entityCacheSelector, collectionCreator);

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
      expect(collectionCreator.create).not.toHaveBeenCalled();
    });
  });

  // Hero has a super-set of EntitySelectors$
  describe('EntitySelectors$Factory.create (Hero)', () => {

    // Selectors don't change during tests
    const selectors = createEntitySelectors<Hero, HeroSelectors>(heroMetadata);

    // Some immutable cache states
    const emptyCache: EntityCache = {};

    const initializedHeroCache: EntityCache = <any> {
      // The state of the HeroCollection in this test suite
      // as the EntityReducer might initialize it.
      Hero: emptyHeroCollection
    };

    let collectionCreator: any;

    let bar: number;
    let collection: HeroCollection;
    let foo: string;
    let heroes: Hero[];
    let loaded: boolean;
    let loading: boolean;

    // The store during tests will be the entity cache
    let store: Store<{ entityCache: EntityCache}>;

    // Observable of state changes, which these tests simulate
    let state$: BehaviorSubject<{ entityCache: EntityCache }>;

    let actions$: Subject<Action>;
    let entityActions: EntityActions;

    const nextCacheState =
      (cache: EntityCache) => state$.next({ entityCache: cache });

    let factory: EntitySelectors$Factory;

    beforeEach(() => {
      collectionCreator  = jasmine.createSpyObj('entityCollectionCreator', ['create']);
      collectionCreator.create.and.returnValue(emptyHeroCollection);
      actions$ = new Subject<Action>();
      entityActions = new EntityActions(<any> actions$);
      state$ = new BehaviorSubject({ entityCache: emptyCache });
      store = new Store<{ entityCache: EntityCache }>(state$, null, null);
      factory = new EntitySelectors$Factory('entityCache', collectionCreator, store, entityActions);

      // listen for changes to the hero collection
      store.select('entityCache', 'Hero')
           .subscribe((c: HeroCollection) => collection = c);
    });

    function subscribeToSelectors(selectors$: HeroSelectors$) {
      selectors$.entities$.subscribe(h => heroes = h);
      selectors$.loaded$.subscribe(l => loaded = l);
      selectors$.loading$.subscribe(l => loading = l);
      selectors$.foo$.subscribe(f => foo = f);
      selectors$.bar$.subscribe(b => bar = b);
    }

    it('can select$ the default empty collection when store collection is undefined ', () => {
      const selectors$ = factory.create<Hero, HeroSelectors$>('Hero', selectors);
      let selectorCollection: EntityCollection<HeroCollection>;
      selectors$.collection$.subscribe(c => selectorCollection = c);
      expect(selectorCollection).toBeDefined('selector collection');
      expect(selectorCollection.entities).toEqual({}, 'entities');

      // Important: the selector is returning these values;
      // They are not actually in the store's entity cache collection!
      expect(collection).toBeUndefined( 'no collection until reducer creates it.');
    });

    it('selectors$ emit default empty values when collection is undefined', () => {
      const selectors$ = factory.create<Hero, HeroSelectors$>('Hero', selectors);

      subscribeToSelectors(selectors$);

      expect(heroes).toEqual([], 'no heroes by default');
      expect(loaded).toBe(false, 'loaded is false by default');
      expect(loading).toBe(false, 'loading is false by default');
      expect(foo).toBe('foo', 'default foo value is "foo"');
      expect(bar).toBe(3.14, 'no default bar value is 3.14');
    });

    it('selectors$ emit updated hero values', () => {
      const selectors$ = factory.create<Hero, HeroSelectors$>('Hero', selectors);

      subscribeToSelectors(selectors$);

      // prime the store for Hero first use as the EntityReducer would
      nextCacheState(initializedHeroCache);

      // set foo and add an entity as the reducer would
      collection = {
        ...collection,
        ...{
          foo: 'FooDoo',
          ids: [42],
          loaded: true,
          entities: {42: {id: 42, name: 'Bob'}}
        }
      };

      // update the store as a reducer would
      nextCacheState({ ...emptyCache, Hero: collection});

      // Selectors$ should have emitted the updated values.
      expect(heroes).toEqual([{id: 42, name: 'Bob'}], 'added a hero');
      expect(loaded).toBe(true, 'loaded'); // as if had QueryAll
      expect(loading).toBe(false, 'loading'); // didn't change
      expect(foo).toEqual('FooDoo', 'updated foo value');
      expect(bar).toEqual(3.14, 'still the initial value'); // didn't change
    });

    it('selectors$ emit supplied defaultCollectionState when collection is undefined', () => {

      // N.B. This is an absurd default state, suitable for test purposes only.
      // The default state feature exists to prevent selectors$ subscriptions
      // from bombing before the collection is initialized or
      // during time-travel debugging.
      const defaultHeroState = createHeroState({
        ids: [1],
        entities: {1: {id: 1, name: 'A'}},
        loaded: true,
        foo: 'foo foo',
        bar: 42
      });

      collectionCreator.create.and.returnValue(defaultHeroState);
      const selectors$ =
        factory.create<Hero, HeroSelectors$>('Hero', selectors); // <- override default state

      subscribeToSelectors(selectors$);

      expect(heroes).toEqual([{id: 1, name: 'A'}], 'default state heroes');
      expect(foo).toEqual('foo foo', 'has default foo');
      expect(bar).toEqual(42, 'has default bar');

      // Important: the selector is returning these values;
      // They are not actually in the store's entity cache collection!
      expect(collection).toBeUndefined( 'no collection until reducer creates it.');
    });

    it('`entityCache$` should observe the entire entity cache', () => {
      const entityCacheValues: any = [];
      factory.entityCache$.subscribe(ec => entityCacheValues.push(ec));

      // prime the store for Hero first use as the EntityReducer would
      nextCacheState(initializedHeroCache);

      expect(entityCacheValues.length).toEqual(2, 'set the cache twice');
      expect(entityCacheValues[0]).toEqual({}, 'empty at first');
      expect(entityCacheValues[1].Hero).toBeDefined('has Hero collection');
    });

    it('`actions$` emits hero collection EntityActions and no other actions', () => {
      const actionsReceived: Action[] = [];
      const selectors$ = factory.create<Hero, HeroSelectors$>('Hero', selectors);
      const entityActions$ = selectors$.entityActions$;
      entityActions$.subscribe(action => actionsReceived.push(action));

      const eaFactory = new EntityActionFactory();
      actions$.next({ type: 'Generic action'});
      // EntityAction but not for heroes
      actions$.next(eaFactory.create('Villain', EntityOp.QUERY_ALL));
      // Hero EntityAction
      const heroAction = eaFactory.create('Hero', EntityOp.QUERY_ALL);
      actions$.next(heroAction);

      expect(actionsReceived.length).toBe(1, 'only one hero action');
      expect(actionsReceived[0]).toBe(heroAction, 'expected hero action');
    });


    it('`errors$` emits hero collection EntityAction errors and no other actions', () => {
      const actionsReceived: Action[] = [];
      const selectors$ = factory.create<Hero, HeroSelectors$>('Hero', selectors);
      const errors$ = selectors$.errors$;
      errors$.subscribe(action => actionsReceived.push(action));

      const eaFactory = new EntityActionFactory();
      actions$.next({ type: 'Generic action'});
      // EntityAction error but not for heroes
      actions$.next(eaFactory.create('Villain', EntityOp.QUERY_ALL_ERROR));
      // Hero EntityAction (but not an error)
      actions$.next(eaFactory.create('Hero', EntityOp.QUERY_ALL));
      // Hero EntityAction Error
      const heroErrorAction = eaFactory.create('Hero', EntityOp.QUERY_ALL_ERROR);
      actions$.next(heroErrorAction);
      expect(actionsReceived.length).toBe(1, 'only one hero action');
      expect(actionsReceived[0]).toBe(heroErrorAction, 'expected error hero action');
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
  selectFoo: Selector<HeroCollection, string>;
  selectBar: Selector<HeroCollection, number>;
}

/** HeroSelectors identifies the extra selectors for the extra collection properties */
interface HeroSelectors$ extends EntitySelectors$<Hero> {
  foo$: Observable<string> | Store<string>;
  bar$: Observable<number> | Store<number>;
}

/// Villain
interface Villain {
  key: string;
  name: string;
}

