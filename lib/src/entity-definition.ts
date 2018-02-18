import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { createEntitySelectors, EntitySelectors } from './entity.selectors';
import { defaultSelectId } from './utils';
import { Dictionary, IdSelector, Update } from './ngrx-entity-models';
import { EntityFilterFn } from './entity-filters';
import { EntityMetadata } from './entity-metadata';
import { EntityCollection, EntityDispatcherOptions } from './interfaces';

export interface EntityDefinition<T = any> {
  entityName: string;
  entityAdapter: EntityAdapter<T>;
  entityDispatcherOptions?: Partial<EntityDispatcherOptions>;
  initialState: EntityCollection<T>;
  metadata: EntityMetadata<T>;
  selectId: IdSelector<T>;
  selectors: EntitySelectors<T>;
}

export function createEntityDefinition<T, S extends object>(
  metadata: EntityMetadata<T, S>
): EntityDefinition<T> {
  // extract known essential properties driving entity definition.
  let entityName = metadata.entityName;
  if (!entityName) {
    throw new Error('Missing required entityName');
  }
  metadata.entityName = entityName = entityName.trim();
  const selectId = metadata.selectId || defaultSelectId;
  const sortComparer = (metadata.sortComparer = metadata.sortComparer || false);

  const entityAdapter = createEntityAdapter<T>({ selectId, sortComparer });

  const entityDispatcherOptions: Partial<EntityDispatcherOptions> =
    metadata.entityDispatcherOptions || {};

  const initialState: EntityCollection<T>  = entityAdapter.getInitialState({
    filter: '',
    loaded: false,
    loading: false,
    originalValues: {},
    ...( metadata.additionalCollectionState || {} )
  });

  const selectors = createEntitySelectors(metadata);

  return {
    entityName,
    entityAdapter,
    entityDispatcherOptions,
    initialState,
    metadata,
    selectId,
    selectors
  };
}
