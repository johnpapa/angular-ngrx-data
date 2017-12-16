import { Action } from '@ngrx/store';
import { EntityClass, getEntityName } from './interfaces';

// General purpose entity action types, good for any entity type
export enum EntityOp {
  // Persisting Actions (more to come)
  QUERY_ALL = 'QUERY_ALL',
  QUERY_ALL_SUCCESS = 'QUERY_ALL_SUCCESS',
  QUERY_ALL_ERROR = 'QUERY_ALL_ERROR',

  QUERY_MANY = 'QUERY_MANY',
  QUERY_MANY_SUCCESS = 'QUERY_MANY_SUCCESS',
  QUERY_MANY_ERROR = 'QUERY_MANY_ERROR',

  QUERY_BY_KEY = 'QUERY_BY_ID',
  QUERY_BY_KEY_SUCCESS = 'QUERY_BY_ID_SUCCESS',
  QUERY_BY_KEY_ERROR = 'QUERY_BY_ID_ERROR',

  SAVE_ADD = 'SAVE_ADD',
  SAVE_ADD_ERROR = 'SAVE_ADD_ERROR',
  SAVE_ADD_SUCCESS = 'SAVE_ADD_SUCCESS',

  SAVE_DELETE = 'SAVE_DELETE',
  SAVE_DELETE_SUCCESS = 'SAVE_DELETE_SUCCESS',
  SAVE_DELETE_ERROR = 'SAVE_DELETE_ERROR',

  SAVE_UPDATE = 'SAVE_UPDATE',
  SAVE_UPDATE_SUCCESS = 'SAVE_UPDATE_SUCCESS',
  SAVE_UPDATE_ERROR = 'SAVE_UPDATE_ERROR',

  // Cache actions
  ADD_ALL = 'ADD_ALL',
  ADD_MANY = 'ADD_MANY',
  ADD_ONE = 'ADD_ONE',
  REMOVE_MANY = 'REMOVE_MANY',
  REMOVE_ONE = 'REMOVE_ONE',
  REMOVE_ALL = 'REMOVE_ALL',
  UPDATE_MANY = 'UPDATE_MANY',
  UPDATE_ONE = 'UPDATE_ONE',

  SET_FILTER = 'SET_FILTER'
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
