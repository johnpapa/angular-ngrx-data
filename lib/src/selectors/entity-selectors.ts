import { createSelector, Selector } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';

import { Dictionary } from '../utils';
import { EntityCollection } from '../reducers/entity-collection';
import { EntityFilterFn } from '../entity-metadata/entity-filters';
import { EntityMetadata } from '../entity-metadata/entity-metadata';

/**
 * The selector functions for entity collection members.
 */
export interface EntitySelectors<T> {
    /** Count of entities in the cached collection. */
  selectCount: Selector<EntityCollection<T>, number>;

   /** All entities in the cached collection. */
  selectEntities: Selector<EntityCollection<T>, T[]>;

  /** Map of entity keys to entities */
  selectEntityMap: Selector<EntityCollection<T>, Dictionary<T>>;

  /** Filter pattern applied by the entity collection's filter function */
  selectFilter: Selector<EntityCollection<T>, string>;

  /** Entities in the cached collection that pass the filter function */
  selectFilteredEntities: Selector<EntityCollection<T>, T[]>;

  /** Keys of the cached collection, in the collection's native sort order */
  selectKeys: Selector<EntityCollection<T>, string[] | number[]>;

  /** True when a multi-entity query command is in progress. */
  selectLoading: Selector<EntityCollection<T>, boolean>;

  /** Original entity values for entities with unsaved changes */
  selectOriginalValues: Selector<EntityCollection<T>, Dictionary<T>>;
}

/**
 * Creates the ngrx/entity selectors or selector functions for an entity collection
 * that an {EntitySelectors$Factory} turns into selectors$.
 * @param entityName - name of the entity for this collection
 * @param filterFn - the collection's {EntityFilterFn}.
 */
export function createEntitySelectors<
  T, S extends EntitySelectors<T> = EntitySelectors<T>>(
  metadata: EntityMetadata<T>
): S {
  // Mostly copied from `@ngrx/entity/state_selectors.ts`
  const selectKeys = (c: EntityCollection<T>) => c.ids;
  const selectEntityMap = (c: EntityCollection<T>) => c.entities;

  const selectEntities = createSelector(
    selectKeys,
    selectEntityMap,
    (keys: any[], entities: Dictionary<T>): any => keys.map(key => entities[key] as T)
  );

  const selectCount = createSelector(selectKeys, keys => keys.length);

  // EntityCollection selectors that go beyond the ngrx/entity/EntityState selectors
  const selectFilter = (c: EntityCollection<T>) => c.filter;

  const filterFn = metadata.filterFn;
  const selectFilteredEntities = filterFn
    ? createSelector(selectEntities, selectFilter, (entities: T[], pattern: any): T[] =>
        filterFn(entities, pattern)
      )
    : selectEntities;

  const selectLoaded = (c: EntityCollection<T>) => c.loaded;
  const selectLoading = (c: EntityCollection<T>) => c.loading;
  const selectOriginalValues = (c: EntityCollection<T>) => c.originalValues;

  // Create selectors for each `additionalCollectionState` property.
  const extra = metadata.additionalCollectionState || {};
  const extraSelectors: { [name: string]: Selector<any, any> } = {};
  Object.keys(extra).forEach(k =>
    extraSelectors['select' + k[0].toUpperCase() + k.slice(1)] =
      (c: any) => c[k]);

  return <S> <any> {
    selectKeys,
    selectEntityMap,
    selectEntities,
    selectCount,
    selectFilter,
    selectFilteredEntities,
    selectLoaded,
    selectLoading,
    selectOriginalValues,
    ...extraSelectors
  };
}
