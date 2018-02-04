import { InjectionToken } from '@angular/core';
import { Action, Store, ActionReducer } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { EntityCollection } from './entity-definition';
import { EntityMetadataMap } from './entity-metadata';
import { IdSelector, Update } from './ngrx-entity-models';

export class DataServiceError {
  readonly message: string;
  constructor(public error: any, public requestData: RequestData) {
    // TODO:  Log properly, not to console
    console.error(error, requestData);
    this.message =
      (error.error && error.error.message) ||
      (error.message ||
      (error.body && error.body.error) ||
       error).toString();
  }
}

export const ENTITY_CACHE_NAME = 'entityCache';
export const ENTITY_CACHE_NAME_TOKEN = new InjectionToken<string>('ENTITY_CACHE_NAME');
export const CREATE_ENTITY_DISPATCHER_TOKEN = new InjectionToken<string>('CREATE_ENTITY_DISPATCHER');
export const ENTITY_METADATA_TOKEN = new InjectionToken<EntityMetadataMap>('ENTITY_METADATA');
export const ENTITY_REDUCER_TOKEN = new InjectionToken<ActionReducer<EntityCache>>(
  'ENTITY_REDUCER'
);
export const PLURAL_NAMES_TOKEN = new InjectionToken<{ [name: string]: string }>('PLURAL_NAMES');

/** Remove leading & trailing spaces or slashes */
export function normalizeApi(api: string) {
  return api.replace(/^[\/\s]+|[\/\s]+$/g, '');
}

/** A service that */
export interface EntityCollectionDataService<T> {
  readonly name: string;
  add(entity: T): Observable<T>;
  delete(id: any): Observable<null>;
  getAll(): Observable<T[]>;
  getById(id: any): Observable<T>;
  getWithQuery(params: QueryParams | string): Observable<T[]>;
  update(update: Update<T>): Observable<Update<T>>;
}

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
export function flattenArgs<T>(args?: any[]): T[] {
  if (args == null) { return []; }
  if (Array.isArray(args[0])) {
    const [head, ...tail] = args;
    args = [...head, ...tail];
  }
  return args;
}

export type HttpMethods = 'DELETE' | 'GET' | 'POST' | 'PUT';

/**
 * A key/value map of parameters to be turned into an HTTP query string
 * Same as HttpClient's HttpParamsOptions which is NOT exported at package level
 * https://github.com/angular/angular/issues/22013
 */
export interface QueryParams { [name: string]: string | string[]; }

export interface RequestData {
  method: HttpMethods;
  url: string;
  options: any;
}
