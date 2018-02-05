import { createSelector, Selector, Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';

import { EntityActions } from './entity.actions';
import { EntityCollection } from './entity-definition';
import { Dictionary } from './ngrx-entity-models';
import { EntitySelectors } from './entity.selectors';
import { EntityCache } from './interfaces';

/**
 * The selector observable functions for entity collection members.
 */
export interface EntitySelectors$<T> {
  /** Observable of actions related to this entity type. */
  actions$: EntityActions;

  /** Observable of count of entities in the cached collection. */
  count$: Observable<number> | Store<number>;

  /** Observable of all entities in the cached collection. */
  entities$: Observable<T[]> | Store<T[]>;

  /** Observable of the map of entity keys to entities */
  entityKeyMap$: Observable<Dictionary<T>> | Store<Dictionary<T>>;

  /** Observable of the filter pattern applied by the entity collection's filter function */
  filter$: Observable<string> | Store<string>;

  /** Observable of entities in the cached collection that pass the filter function */
  filteredEntities$: Observable<T[]> | Store<T[]>;

  /** Observable of the keys of the cached collection, in the collection's native sort order */
  keys$: Observable<string[] | number[]> | Store<string[] | number[]>;

  /** Observable true when a multi-entity query command is in progress. */
  loading$: Observable<boolean> | Store<boolean>;
}

/**
 * Creates an entity collection's selectors$ observables for a given EntityCache store.
 * `selectors$` are observable selectors of the cached entity collection.
 * @param entityName - is also the name of the collection.
 * @param store - Ngrx store at runtime. Often the application's root store which holds the entity cache.
 * @param cacheSelector - an ngrx/entity Selector that selects the entity cache from that store
 * @param selectors - selector functions for this collection.
 * @param defaultCollectionState - default state of the collection,
 * if the collection is undefined when the selector is invoked
 * (as happens with time-travel debugging).
 **/
export function createEntitySelectors$<
  T,
  S$ extends EntitySelectors$<T> = EntitySelectors$<T>,
  C extends EntityCollection<T> = EntityCollection<T>
  >(
  entityName: string,
  store: Store<any>,
  cacheSelector: Selector<Object, EntityCache>,
  selectors: EntitySelectors<T>,
  defaultCollectionState?: C
): S$ {
  defaultCollectionState = defaultCollectionState || createEmptyEntityCollection<T, C>();
  const cc = createCachedCollectionSelector(entityName, cacheSelector, defaultCollectionState);
  const collection$ = store.select(cc);

  const selectors$: Partial<EntitySelectors$<T>> = {};

  Object.keys(selectors).forEach(
    name => {
      // strip 'select' prefix from the selector fn name and append `$`
      // Ex: 'selectEntities' => 'entities$'
      const name$ = name[6].toLowerCase() + name.substr(7) + '$';
      (<any>selectors$)[name$] = collection$.select((<any>selectors)[name]
    )}
  );

  return selectors$ as S$;
}

/**
 * Creates the selector for the path from the EntityCache through the Collection
 * @param collectionName - which is also the entity name
 * @param cacheSelector - selects the EntityCache from the store.
 * @param initialState - initial state of the collection,
 * used if the collection is undefined when the selector is invoked
 * (as happens with time-travel debugging).
 */
export function createCachedCollectionSelector<T, C extends EntityCollection<T> = EntityCollection<T>> (
  collectionName: string,
  cacheSelector: Selector<Object, EntityCache>,
  initialState?: C
): Selector<Object, C> {
  initialState = initialState || createEmptyEntityCollection<T, C>();
  const getCollection = (cache: EntityCache) => <C> cache[collectionName] || initialState;
  return createSelector(cacheSelector, getCollection);
}

function createEmptyEntityCollection<T, C extends EntityCollection<T> = EntityCollection<T>>(): C {
  return <C> {
    ids: [],
    entities: {},
    filter: undefined,
    loading: false
  };
}
