import { defaultSelectId, EntityMetadataMap, PropsFilterFnFactory } from 'ngrx-data';

import { Hero, Villain } from '../core/model';

/////////
// AOT obliges us to encapsulate the logic in wrapper functions
export function sortByName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name);
}

/**
 * Returns the `id` property value as the primary key for any entity with an `id` property.
 * This function is a demonstration.
 * It isn't necessary because `id` is the primary key property by default.
 */
export function villainSelectId<T extends { id: any }>(entity: T) {
  return entity == null ? undefined : entity.id;
}

/** Filter for entities whose name matches the case-insensitive pattern */
export function nameFilter<T>(entities: T[], pattern: string) {
  return PropsFilterFnFactory(['name'])(entities, pattern);
}

/** Filter for entities whose name or saying matches the case-insensitive pattern */
export function nameAndSayingFilter<T>(entities: T[], pattern: string) {
  return PropsFilterFnFactory(['name', 'saying'])(entities, pattern);
}
////////////

export const entityMetadata: EntityMetadataMap = {

  Hero: {
    filterFn: nameFilter,    // optional
    sortComparer: sortByName // optional
  },

  Villain: {
    entityName: 'Villain', // optional because same as map key
    selectId: villainSelectId,  //  a non-default function
    filterFn: nameAndSayingFilter, // optional
    // Optional: overrides certain default dispatcher behaviors
    entityDispatcherOptions: { optimisticAdd: true, optimisticUpdate: true }
  }
};

export const pluralNames = {
  // Case matters. Match the case of the entity name.
  Hero: 'Heroes'
};
