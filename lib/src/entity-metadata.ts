import { EntityDispatcherOptions } from './interfaces';
import { EntityFilterFn } from './entity-filters';
import { IdSelector, Comparer } from './ngrx-entity-models';

/** Map entity-type name to its EntityMetadata */
export interface EntityMetadataMap {
  [entityName: string]: Partial<EntityMetadata<any>>;
}

/** Metadata that describe an entity type and its collection to ngrx-data */
export interface EntityMetadata<T = any, S extends object = {}> {
  entityName: string;
  entityDispatcherOptions?: Partial<EntityDispatcherOptions>,
  filterFn?: EntityFilterFn<T>;
  selectId?: IdSelector<T>;
  sortComparer?: false | Comparer<T>;
  additionalCollectionState?: S
}
