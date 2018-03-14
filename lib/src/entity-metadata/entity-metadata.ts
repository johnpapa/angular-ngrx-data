import { InjectionToken } from '@angular/core';
import { EntityDispatcherOptions } from '../dispatchers/entity-dispatcher';
import { EntityFilterFn } from './entity-filters';
import { IdSelector, Comparer } from '../utils';

export const ENTITY_METADATA_TOKEN = new InjectionToken<EntityMetadataMap>('ngrx-data/Entity Metadata');

/** Metadata that describe an entity type and its collection to ngrx-data */
export interface EntityMetadata<T = any, S extends object = {}> {
  entityName: string;
  entityDispatcherOptions?: Partial<EntityDispatcherOptions>,
  filterFn?: EntityFilterFn<T>;
  selectId?: IdSelector<T>;
  sortComparer?: false | Comparer<T>;
  additionalCollectionState?: S
}

/** Map entity-type name to its EntityMetadata */
export interface EntityMetadataMap {
  [entityName: string]: Partial<EntityMetadata<any>>;
}
