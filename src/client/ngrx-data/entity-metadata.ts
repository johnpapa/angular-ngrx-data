import { EntityFilterFn } from './entity-filters';

import { IdSelector, Comparer } from './ngrx-entity-models';

export interface EntityMetadataMap {
  [entity: string]: EntityMetadata<any>;
}

export interface EntityMetadata<T> {
  entityName: string;
  filterFn?: EntityFilterFn<T>;
  selectId?: IdSelector<T>;
  sortComparer?: false | Comparer<T>;
}
