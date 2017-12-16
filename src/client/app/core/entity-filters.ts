import { EntityFilters, ENTITY_FILTERS } from '../../ngrx-data';

/** EntityFilter function: match pattern in the name or the saying. */
function NameOrSayingFilterFn<T>(entities: T[], pattern: string) {
  pattern = pattern && pattern.trim();
  if (!pattern) {
    return entities;
  }
  const regEx = new RegExp(pattern, 'i');
  return entities.filter((e: any) => regEx.test(e.name) || regEx.test(e.saying));
}

export const NAME_OR_SAYING_FILTER = 'NameOrSaying';

/** Custom application entity filters */
export const entityFilters: EntityFilters = {
  [NAME_OR_SAYING_FILTER]: { filterFn: NameOrSayingFilterFn }
  // '': { filterFn: NameOrSayingFilterFn } // replace the default
};

export const entityFiltersProvider = {
  provide: ENTITY_FILTERS,
  multi: true,
  useValue: entityFilters
};
