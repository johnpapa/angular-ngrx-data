// General purpose entity action types, good for any entity type
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

// Calculated by delete$ effect
export const _DELETE_BY_INDEX = '_DELETE_BY_INDEX';
export const _DELETE = '_DELETE';
export const _DELETE_SUCCESS = '_DELETE_SUCCESS';
export const _DELETE_ERROR = '_DELETE_ERROR';

export const DELETE = 'DELETE';
export const DELETE_BY_ID = 'DELETE_BY_ID';

export const GET_FILTERED = 'GET_FILTERED';
export const SET_FILTER = 'SET_FILTER';

export const SET_LOADING = 'SET_LOADING';

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
  | 'DELETE_BY_ID'
  | '_DELETE_BY_INDEX'
  | '_DELETE'
  | '_DELETE_SUCCESS'
  | '_DELETE_ERROR'
  | 'GET_FILTERED'
  | 'SET_FILTER'
  | 'SET_LOADING';
