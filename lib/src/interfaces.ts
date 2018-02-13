import { Injectable, InjectionToken } from '@angular/core';
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
export const ENTITY_CACHE_NAME_TOKEN = new InjectionToken<string>('ngrx-data/Entity Cache Name');
export const ENTITY_METADATA_TOKEN = new InjectionToken<EntityMetadataMap>('ngrx-data/Entity Metadata');
export const ENTITY_COLLECTION_META_REDUCERS = new InjectionToken('ngrx-data/Entity Collection MetaReducers');
export const ENTITY_REDUCER_TOKEN = new InjectionToken<ActionReducer<EntityCache>>(
  'ngrx-data/Entity Reducer'
);
export const PLURAL_NAMES_TOKEN = new InjectionToken<{ [name: string]: string }>('ngrx-data/Plural Names');

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

@Injectable()
export class EntityDataServiceConfig {
  api? = 'api';
  getDelay? = 0;
  saveDelay? = 0;
  timeout? = 0;
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


