import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { EntityClass, getEntityName } from './interfaces';

/** EntityAction Filter payload */
export interface EntityFilter {
  /** Name of the filter */
  name?: string;
  /** Search pattern for the filter to apply */
  pattern?: any;
}

/**
 * Filters the `entities` array argument and returns the `entities`,
 * a memoized array of entities, or a new filtered array.
 * NEVER mutate the `entities` array itself.
 **/
export type EntityFilterFn<T> = (entities: T[], pattern?: any) => T[];

export interface EntityFilterDef<T> {
  filterFn: EntityFilterFn<T>;
  include?: string[]; // entity type names to include
  exclude?: string[]; // entity type names to exclude
}

export interface EntityFilters { [name: string]: EntityFilterDef<any> }

export const ENTITY_FILTERS = new InjectionToken<EntityFilters>('ENTITY_FILTERS');

/** EntityFilter function: match pattern in the entity name. */
export function GenericNameFilterFn<T>(entities: T[], pattern: string) {
  pattern = pattern && pattern.trim();
  if (!pattern) { return entities; }
  const regEx = new RegExp(pattern, 'i');
  return entities.filter((e: any) => regEx.test(e.name));
}

/** The default EntityFilter */
export const DefaultEntityFilters: EntityFilters = {
  '': { filterFn: GenericNameFilterFn }
}

@Injectable()
export class EntityFilterService {

  private filters: EntityFilters = { };

  constructor(@Optional() @Inject(ENTITY_FILTERS) filters: EntityFilters[] = []) {
    filters.forEach(f => this.registerFilters(f));
  }

 /**
   * Get an {EntityFilter} by name.
   * @param name - filter name; empty name is the default filter
   *
   * Examples:
   *   getFilter('');// the default filter
   *   getFilter('Foo'); // the filter named 'Foo'
   *   getFilter('Hero'); // a filter for heroes only
   */
  getFilter<T>(name = '', entityName?: EntityClass<T> | string): EntityFilterDef<T> {
    name = name.trim();
    entityName = getEntityName(entityName);
    const filter = this.filters[name];
    if (!filter) {
      throw new Error(`No filter named "${name}" for ${entityName} entities.`);
    }
    if (!entityName) { return filter; }
    if ((filter.exclude && -1 !== filter.exclude.indexOf(entityName)) ||
        (filter.include && -1 === filter.include.indexOf(entityName))
      ) {
        throw new Error(`Filter "${name}" disallowed for ${entityName} entities.`);
    }
    return filter;
  }
  getFilterFn<T>(name = '', entityName?: EntityClass<T> | string): EntityFilterFn<T> {
    return this.getFilter<T>(name, entityName).filterFn;
  }


  /**
   * Register a filter for an entity class
   * @param entityClass - the name of the entity class or the class itself
   * @param filter - filter for that entity class
   *
   * Examples:
   *   registerFilter('', MyDefaultFilter);
   *   registerFilter('Foo', MyFooFilter);
   *   registerFilter('Hero', MyHeroOnlyFilter);
   */
  registerFilter<T>(name: string, filter: EntityFilterDef<T>) {
    this.filters[name] = filter;
  }

  /**
   * Register a batch of filters.
   * @param filters - filters to merge into existing filters
   *
   * Examples:
   *   registerFilters({
   *     '': MyDefaultFilter,
   *     Foo: MyFooFilter,
   *     Hero: MyHeroOnlyFilter,
   *   });
   */
  registerFilters(filters: EntityFilters) {
    this.filters = { ...this.filters, ...filters };
  }
}
