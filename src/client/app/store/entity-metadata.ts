import { EntityMetadataMap, PropsFilterFnFactory } from 'ngrx-data';

import { Hero, Villain } from '../core/model';

/////////
// AOT obliges us to encapsulate the logic in wrapper functions
export function sortByName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name);
}

export function selectId<T extends { id: any }>(entity: T) {
  return entity.id;
}

export function nameFilter<T>(entities: T[], pattern: string) {
  return PropsFilterFnFactory<any>(['name'])(entities, pattern);
}

export function nameAndSayingFilter<T>(entities: T[], pattern: string) {
  return PropsFilterFnFactory<any>(['name', 'saying'])(entities, pattern);
}
////////////

export const entityMetadata: EntityMetadataMap = {
  Hero: {
    entityName: 'Hero', // required for minification
    selectId, // not necessary but shows you can supply a function
    sortComparer: sortByName,
    filterFn: nameFilter
  },
  Villain: {
    entityName: 'Villain', // required for minification
    filterFn: nameAndSayingFilter
  }
};

export const pluralNames = {
  // Case matters. Match the case of the entity name.
  Hero: 'Heroes'
};
