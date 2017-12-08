import { Action, Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';

export class DataServiceError<T> {
  constructor(public error: any, public requestData: T) {}
}

export type EntityOp =
  | 'GET_ALL'
  | 'GET_ALL_SUCCESS'
  | 'GET_ALL_ERROR'
  | 'GET_BY_ID'
  | 'GET_BY_ID_ALL_SUCCESS'
  | 'GET_BY_ID_ERROR'
  | 'ADD'
  | 'ADD_SUCCESS'
  | 'ADD_ERROR'
  | 'UPDATE'
  | 'UPDATE_SUCCESS'
  | 'UPDATE_ERROR'
  | 'DELETE'
  | 'DELETE_SUCCESS'
  | 'DELETE_ERROR'
  | 'GET_FILTERED'
  | 'SET_FILTER';

export class EntityAction<T extends Object, P> implements Action {
  readonly type: string;
  readonly entityTypeName: string;

  constructor(
    public readonly entityType: EntityClass<T>,
    public readonly op: EntityOp,
    public readonly payload?: P
  ) {
    this.entityTypeName = this.entityType.name;
    this.type = this.op;
    // this.type = `[${this.entityType.name}] ${this.op}`;
  }
}

export abstract class EntityCollectionDataService<T> {
  abstract getAll(options?: any): Observable<T[]>;
  abstract getById(id: any): Observable<T>;
  abstract add(entity: T): Observable<T>;
  abstract delete(entity: T): Observable<T>;
  abstract update(entity: T): Observable<T>;
}

export abstract class EntityDataService {
  abstract getService<T>(serviceName: string): EntityCollectionDataService<T>;
}

export type EntityClass<T extends Object> = new (...x: any[]) => T;

export interface EntityCache {
  // Must be any since we don't know what type of collections we will have
  [name: string]: EntityCollection<any>;
}

export class EntityCollection<T> {
  filter = '';
  entities: T[] = [];
  filteredEntities: T[] = [];
  loading = false;
  error = false;
}
