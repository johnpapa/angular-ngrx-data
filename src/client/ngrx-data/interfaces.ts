import { InjectionToken } from '@angular/core';
import { Action, Store, ActionReducer } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { EntityCollection } from './entity-definition';
import { EntityMetadataMap } from './entity-metadata';

export class DataServiceError<T> {
  constructor(public error: any, public requestData: T) {}
}

export const ENTITY_CACHE_NAME = 'entityCache';
export const ENTITY_CACHE_NAME_TOKEN = new InjectionToken<string>('ENTITY_CACHE_NAME');
export const ENTITY_METADATA_TOKEN = new InjectionToken<EntityMetadataMap>('ENTITY_METADATA');
export const ENTITY_REDUCER_TOKEN = new InjectionToken<ActionReducer<EntityCache>>(
  'Entity Reducer'
);
export const PLURAL_NAMES_TOKEN = new InjectionToken<{ [name: string]: string }>('PLURAL_NAMES');

export abstract class EntityCollectionDataService<T> {
  abstract getAll(options?: any): Observable<T[]>;
  abstract getById(id: any): Observable<T>;
  abstract add(entity: T): Observable<T>;
  abstract delete(id: any): Observable<T>;
  abstract update(entity: T): Observable<T>;
}

export type entityName<T extends Object> = new (...x: any[]) => T;

export interface EntityCache {
  // Must be `any` since we don't know what type of collections we will have
  [name: string]: EntityCollection<any>;
}

/**
 * Flatten first arg if it is an array
 * Allows fn with ...rest signature to be called with an array instead of spread
 * Example:
 * ```
 * // EntityActions.ofOp
 * const persistOps = [EntityOp.QUERY_ALL, EntityOp.ADD, ...];
 * ofOp(...persistOps) // works
 * ofOp(persistOps) // also works
 * ```
 * */
export function flattenArgs<T>(args: any[]): T[] {
  if (Array.isArray(args[0])) {
    const [head, ...tail] = args;
    args = [...head, ...tail];
  }
  return args;
}
