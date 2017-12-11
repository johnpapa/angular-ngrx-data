import { Action } from '@ngrx/store';
import { EntityClass, getEntityName } from './interfaces';

// General purpose entity action types, good for any entity type
export enum EntityOp {
  GET_ALL = 'GET_ALL',
  GET_ALL_SUCCESS = 'GET_ALL_SUCCESS',
  GET_ALL_ERROR = 'GET_ALL_ERROR',

  GET_BY_ID = 'GET_BY_ID',
  GET_BY_ID_SUCCESS = 'GET_BY_ID_SUCCESS',
  GET_BY_ID_ERROR = 'GET_BY_ID_ERROR',

  ADD = 'ADD',
  ADD_ERROR = 'ADD_ERROR',
  ADD_SUCCESS = 'ADD_SUCCESS',

  UPDATE = 'UPDATE',
  UPDATE_SUCCESS = 'UPDATE_SUCCESS',
  UPDATE_ERROR = 'UPDATE_ERROR',

  // Calculated by delete$ effect
  _DELETE_BY_INDEX = '_DELETE_BY_INDEX',
  _DELETE = '_DELETE',
  _DELETE_SUCCESS = '_DELETE_SUCCESS',
  _DELETE_ERROR = '_DELETE_ERROR',

  DELETE = 'DELETE',
  DELETE_BY_ID = 'DELETE_BY_ID',

  GET_FILTERED = 'GET_FILTERED',
  SET_FILTER = 'SET_FILTER',
  SET_FILTER_PATTERN = 'SET_FILTER_PATTERN',

  SET_LOADING = 'SET_LOADING',
}

export class EntityAction<T extends Object, P> implements Action {
  readonly type: string;
  readonly entityName: string;

  static formatActionTypeName(op: string, entityName: string) {
    return `${op} [${entityName}]`.toUpperCase();
    // return `[${entityName}] ${op.toUpperCase()} `; // an alternative
  }

  constructor(
    classOrAction: EntityClass<T> | string | EntityAction<T, any>,
    public readonly op: EntityOp,
    public readonly payload?: P
  ) {
    this.entityName =
      classOrAction instanceof EntityAction
        ? classOrAction.entityName
        : getEntityName(classOrAction);
    this.type = EntityAction.formatActionTypeName(op, this.entityName);
  }
}
