import { EntityFilterFn } from './entity-filters';

import { IdSelector, Comparer } from './entity-definition';

export interface EntityMetadataMap { [entity: string]: EntityMetadata<any> }

export interface EntityMetadata<T> {
  entityName?: string;
  filterFn?: EntityFilterFn<T>;
  selectId?: IdSelector<T>;
  sortComparer?: false | Comparer<T>;
}
