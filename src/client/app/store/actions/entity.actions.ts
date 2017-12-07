import { Action } from '@ngrx/store';
import { DataServiceError } from '../services';
import { DataAction, DataErrorAction } from './data.actions';

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


export type EntityClass<T> = new (...x: any[]) => T;

export class EntityAction<T, P> implements Action {
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
