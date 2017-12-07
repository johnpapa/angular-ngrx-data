import { Action } from '@ngrx/store';
import { DataServiceError, EntityClass } from './interfaces';
// General purpose entity action stuff, good for any entity type

import { Observable } from 'rxjs/Observable';
import { catchError, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

export const GET_ALL = 'GET_ALL';
export const GET_ALL_SUCCESS = 'GET_ALL_SUCCESS';
export const GET_ALL_ERROR = 'GET_ALL_ERROR';

export const GET_BY_ID = 'GET_BY_ID';
export const GET_BY_ID_SUCCESS = 'GET_BY_ID_SUCCESS';
export const GET_BY_ID_ERROR = 'GET_BY_ID_ERROR';

export const ADD = 'ADD';
export const ADD_ERROR = 'ADD_ERROR';
export const ADD_SUCCESS = 'ADD_SUCCESS';

export const UPDATE = 'UPDATE';
export const UPDATE_SUCCESS = 'UPDATE_SUCCESS';
export const UPDATE_ERROR = 'UPDATE_ERROR';

export const DELETE = 'DELETE';
export const DELETE_SUCCESS = 'DELETE_SUCCESS';
export const DELETE_ERROR = 'DELETE_ERROR';

export const GET_FILTERED = 'GET_FILTERED';
export const SET_FILTER = 'SET_FILTER';

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

  constructor(
    public readonly entityType: EntityClass<T>,
    public readonly entityTypeName: string,
    public readonly op: EntityOp,
    public readonly payload?: P
  ) {
    this.entityTypeName = this.entityType.name;
    this.type = this.op;
    // this.type = `[${this.entityType.name}] ${this.op}`;
  }
}

export abstract class DataAction<T> implements Action {
  readonly type: string;
  constructor(public readonly payload: T) {}
}

export abstract class DataErrorAction<T> implements Action {
  readonly type: string;
  constructor(public readonly payload: DataServiceError<T>) {}
}

// Function of additional success actions
// that returns a function that returns
// an observable of ngrx action(s) from DataService method observable
export function toAction<T>(...actions: Action[]) {
  return (
  source: Observable<T>,
  successAction: new (data: T) => Action,
  errorAction: new (err: DataServiceError<T>) => Action
  ) =>
    source.pipe(
      mergeMap((data: T) => [new successAction(data), ...actions]),
      catchError((err: DataServiceError<T>) => of(new errorAction(err)))
    );
}
