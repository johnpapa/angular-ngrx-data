import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { EntityFilterFn } from './entity-filters';
import { EntityCollectionReducer, createEntityCollectionReducer } from './entity.reducer';
import { EntityClass, getEntityName } from './interfaces';
import { EntityMetadata } from './entity-metadata'
import { createEntitySelectors,  createEntitySelectors$Factory, EntitySelectors, EntitySelectors$Factory } from './entity.selectors'

/////////////////
// Copied from @ngrx/entity/models because that lib doesn't export them
export type ComparerStr<T> = (a: T, b: T) => string;
export type ComparerNum<T> = (a: T, b: T) => number;
export type Comparer<T> = ComparerNum<T> | ComparerStr<T>;
export type IdSelectorStr<T> = (model: T) => string;
export type IdSelectorNum<T> = (model: T) => number;
export type IdSelector<T> = IdSelectorStr<T> | IdSelectorNum<T>;
export interface DictionaryNum<T> { [id: number]: T; }
export abstract class Dictionary<T> implements DictionaryNum<T> { [id: string]: T; }
//////////////////////

export interface EntityCollection<T> extends EntityState<T> {
  filter: string;
  loading: boolean;
}

export interface EntityDefinition<T> {
  entityName: string;
  entityAdapter: EntityAdapter<T>;
  initialState: any;
  metadata: EntityMetadata<T>;
  reducer: EntityCollectionReducer<T>;
  selectors: EntitySelectors<T>;
  selectors$Factory: EntitySelectors$Factory<T>
}

export interface EntityDefinitions {[entityName: string]: EntityDefinition<any>}

export function createEntityDefinition<T>(
  entityClass: EntityClass<T> | string,
  metadata: EntityMetadata<T>,
  additionalCollectionState: {} = {}
) {
  const entityName = getEntityName(entityClass) || metadata.entityName;
  if (!entityName) { throw new Error('Missing required entityName'); }

  // extract known essential properties driving entity definition.
  const {
    selectId = (entity: any) => entity.id,
    sortComparer = false,
  } = metadata;
  const entityAdapter = createEntityAdapter<T>({selectId, sortComparer});

  const initialState =  entityAdapter.getInitialState(
    { ...{ filter: '', loading: false },
      ...additionalCollectionState }
    );

  const reducer = createEntityCollectionReducer<T>(entityName, entityAdapter, metadata);

  const selectors = createEntitySelectors<T>(entityName, metadata.filterFn);

  const selectors$Factory = createEntitySelectors$Factory<T>(entityName, selectors)

  return {
    entityName, entityAdapter, initialState, metadata, reducer, selectors, selectors$Factory
  }
}
