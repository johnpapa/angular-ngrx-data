import { EntityDispatcherOptions } from './interfaces';
import { EntityFilterFn } from './entity-filters';
import { IdSelector, Comparer } from './ngrx-entity-models';

export interface EntityMetadataMap {
  [entity: string]: EntityMetadata<any>;
}

export interface EntityMetadata<T = any, S extends object = {}> {
  entityName: string;
  entityDispatcherOptions?: Partial<EntityDispatcherOptions>,
  filterFn?: EntityFilterFn<T>;
  selectId?: IdSelector<T>;
  sortComparer?: false | Comparer<T>;
  additionalCollectionState?: S
}
