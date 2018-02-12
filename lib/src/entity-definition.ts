import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { EntityFilterFn } from './entity-filters';
import { EntityMetadata } from './entity-metadata';
import { createEntitySelectors, EntitySelectors } from './entity.selectors';
import { IdSelector, Update } from './ngrx-entity-models';

export interface EntityCollection<T = any> extends EntityState<T> {
  /** user's filter pattern */
  filter: string;
  /** true if collection was ever filled by QueryAll; forced false if cleared */
  loaded: boolean;
  /** true when multi-entity HTTP query operation is in flight */
  loading: boolean;
}

export interface EntityDefinition<T = any> {
  entityName: string;
  entityAdapter: EntityAdapter<T>;
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
  const selectId = (metadata.selectId = metadata.selectId || ((entity: any) => entity.id));
  const sortComparer = (metadata.sortComparer = metadata.sortComparer || false);

  const entityAdapter = createEntityAdapter<T>({ selectId, sortComparer });

  const initialState: EntityCollection<T>  = entityAdapter.getInitialState({
    filter: '', loaded: false, loading: false, ...( metadata.additionalCollectionState || {} )
  });

  const selectors = createEntitySelectors(metadata);

  return {
    entityName,
    entityAdapter,
    initialState,
    metadata,
    selectId,
    selectors
  };
}
