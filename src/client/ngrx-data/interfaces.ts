import { InjectionToken } from '@angular/core';
import { Action, Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { EntityCollection } from './entity-definition';

export class DataServiceError<T> {
  constructor(public error: any, public requestData: T) {}
}

export const ENTITY_CACHE_NAME = new InjectionToken<string>('ENTITY_CACHE_NAME');

export abstract class EntityCollectionDataService<T> {
  abstract getAll(options?: any): Observable<T[]>;
  abstract getById(id: any): Observable<T>;
  abstract add(entity: T): Observable<T>;
  abstract delete(id: any): Observable<T>;
  abstract update(entity: T): Observable<T>;
}

export type EntityClass<T extends Object> = new (...x: any[]) => T;

export interface EntityCache {
  // Must be `any` since we don't know what type of collections we will have
  [name: string]: EntityCollection<any>;
}

/**
 * Get name of the entity type (e.g. "Hero")
 * @param entityClass - the name of the entity type or the class itself
 */
export function getEntityName<T>(entityClass: string | EntityClass<T>) {
  return (typeof entityClass === 'string' ? entityClass : entityClass.name).trim();
}
