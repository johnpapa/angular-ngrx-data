import {
  defaultSelectId,
  EntityMetadataMap,
  PropsFilterFnFactory
} from 'ngrx-data';

export const entityMetadata: EntityMetadataMap = {
  Hero: {
    filterFn: nameFilter, // optional
    sortComparer: sortByName // optional
  },

  Villain: {
    selectId: villainSelectId, //  a non-default function
    filterFn: nameAndSayingFilter,

    // Performs optimistic add and update. See VillainsService
    entityDispatcherOptions: { optimisticAdd: true, optimisticUpdate: true }
  }
};

export const pluralNames = {
  // Not needed for data access when set Hero's HttpResourceUrls; see `entity-store.module.ts`.
  // Case matters. Match the case of the entity name.
  Hero: 'Heroes'
};

// Can't just put the function in the entityMetadata literal
// AOT obliges us to encapsulate the logic in wrapper functions

/** Filter for entities whose name matches the case-insensitive pattern */
export function nameFilter<T extends { name: string }>(
  entities: T[],
  pattern: string
) {
  return PropsFilterFnFactory(['name'])(entities, pattern);
}

/** Sort Comparer to sort the entity collection by its name property */
export function sortByName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name);
}

/** Filter for entities whose name or saying matches the case-insensitive pattern */
export function nameAndSayingFilter<T extends { name: string; saying: string }>(
  entities: T[],
  pattern: string
) {
  return PropsFilterFnFactory(['name', 'saying'])(entities, pattern);
}

/**
 * Returns the `id` property value as the primary key for any entity with an `id` property.
 * This function is a demonstration.
 * It isn't necessary because `id` is the primary key property by default.
 * But it would be necessary if key were other than `id`.
 */
export function villainSelectId<T extends { id: any }>(entity: T) {
  return entity == null ? undefined : entity.id;
}
