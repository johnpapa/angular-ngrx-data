import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { EntityFilterFn } from './entity-filters';
import { EntityCollectionReducer, createEntityCollectionReducer } from './entity.reducer';
import { EntityMetadata } from './entity-metadata';
import { createEntitySelectors, EntitySelectors } from './entity.selectors';

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
}

export interface EntityDefinitions {
  [entityName: string]: EntityDefinition<any>;
}

export function createEntityDefinition<T>(
  metadata: EntityMetadata<T>,
  additionalCollectionState: {} = {}
) {
  let entityName = metadata.entityName;
  if (!entityName) {
    throw new Error('Missing required entityName');
  }

  metadata.entityName = entityName = entityName.trim();
  metadata.selectId = metadata.selectId || ((entity: any) => entity.id);

  // extract known essential properties driving entity definition.
  const { selectId, sortComparer } = metadata;
  const entityAdapter = createEntityAdapter<T>({ selectId, sortComparer });

  const initialState = entityAdapter.getInitialState({
    ...{ filter: '', loading: false },
    ...additionalCollectionState
  });

  const reducer = createEntityCollectionReducer<T>(entityName, entityAdapter, metadata);

  const selectors = createEntitySelectors<T>(entityName, metadata.filterFn);

  return {
    entityName,
    entityAdapter,
    initialState,
    metadata,
    reducer,
    selectors
  };
}
