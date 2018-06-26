/** "Success" suffix appended to EntityOps that are successful.*/
export const OP_SUCCESS = '/success';

/** "Error" suffix appended to EntityOps that have failed.*/
export const OP_ERROR = '/error';

/** "No tracking" suffix appended to certain EntityOps that should not their changes to cache.*/
export const OP_NO_TRACK = '-no-track';

// Ensure that these suffix values and the EntityOp suffixes match
// Cannot do that programmatically.

/** General purpose entity action operations, good for any entity type */
export enum EntityOp {
  // Persisting operations
  QUERY_ALL = 'ngrx-data/query-all',
  QUERY_ALL_SUCCESS = 'ngrx-data/query-all/success',
  QUERY_ALL_ERROR = 'ngrx-data/query-all/error',

  QUERY_MANY = 'ngrx-data/query-many',
  QUERY_MANY_SUCCESS = 'ngrx-data/query-many/success',
  QUERY_MANY_ERROR = 'ngrx-data/query-many/error',

  QUERY_BY_KEY = 'ngrx-data/query-by-key',
  QUERY_BY_KEY_SUCCESS = 'ngrx-data/query-by-key/success',
  QUERY_BY_KEY_ERROR = 'ngrx-data/query-by-key/error',

  SAVE_ADD_ONE = 'ngrx-data/save/add-one',
  SAVE_ADD_ONE_ERROR = 'ngrx-data/save/add-one/error',
  SAVE_ADD_ONE_SUCCESS = 'ngrx-data/save/add-one/success',

  SAVE_DELETE_ONE = 'ngrx-data/save/delete-one',
  SAVE_DELETE_ONE_SUCCESS = 'ngrx-data/save/delete-one/success',
  SAVE_DELETE_ONE_ERROR = 'ngrx-data/save/delete-one/error',

  SAVE_UPDATE_ONE = 'ngrx-data/save/update-one',
  SAVE_UPDATE_ONE_SUCCESS = 'ngrx-data/save/update-one/success',
  SAVE_UPDATE_ONE_ERROR = 'ngrx-data/save/update-one/error',

  SAVE_ADD_ONE_OPTIMISTIC = 'ngrx-data/save/add-one/optimistic',
  SAVE_ADD_ONE_OPTIMISTIC_ERROR = 'ngrx-data/save/add-one/optimistic/error',
  SAVE_ADD_ONE_OPTIMISTIC_SUCCESS = 'ngrx-data/save/add-one/optimistic/success',

  SAVE_DELETE_ONE_OPTIMISTIC = 'ngrx-data/save/delete-one/optimistic',
  SAVE_DELETE_ONE_OPTIMISTIC_SUCCESS = 'ngrx-data/save/delete-one/optimistic/success',
  SAVE_DELETE_ONE_OPTIMISTIC_ERROR = 'ngrx-data/save/delete-one/optimistic/error',

  SAVE_UPDATE_ONE_OPTIMISTIC = 'ngrx-data/save/update-one/optimistic',
  SAVE_UPDATE_ONE_OPTIMISTIC_SUCCESS = 'ngrx-data/save/update-one/optimistic/success',
  SAVE_UPDATE_ONE_OPTIMISTIC_ERROR = 'ngrx-data/save/update-one/optimistic/error',

  // Cache operations
  ADD_ALL = 'ngrx-data/add-all',
  ADD_MANY = 'ngrx-data/add-many',
  ADD_MANY_NO_TRACK = 'ngrx-data/add-many-no-track',
  ADD_ONE = 'ngrx-data/add-one',
  ADD_ONE_NO_TRACK = 'ngrx-data/add-one-no-track',
  REMOVE_ALL = 'ngrx-data/remove-all',
  REMOVE_MANY = 'ngrx-data/remove-many',
  REMOVE_MANY_NO_TRACK = 'ngrx-data/remove-many-no-track',
  REMOVE_ONE = 'ngrx-data/remove-one',
  REMOVE_ONE_NO_TRACK = 'ngrx-data/remove-one-no-track',
  UPDATE_MANY = 'ngrx-data/update-many',
  UPDATE_MANY_NO_TRACK = 'ngrx-data/update-many-no-track',
  UPDATE_ONE = 'ngrx-data/update-one',
  UPDATE_ONE_NO_TRACK = 'ngrx-data/update-one-no-track',
  UPSERT_MANY = 'ngrx-data/upsert-many',
  UPSERT_MANY_NO_TRACK = 'ngrx-data/upsert-many-no-track',
  UPSERT_ONE = 'ngrx-data/upsert-one',
  UPSERT_ONE_NO_TRACK = 'ngrx-data/upsert-one-no-track',

  COMMIT_ALL = 'ngrx-data/commit-all',
  COMMIT_MANY = 'ngrx-data/commit-many',
  COMMIT_ONE = 'ngrx-data/commit-one',
  UNDO_ALL = 'ngrx-data/undo-all',
  UNDO_MANY = 'ngrx-data/undo-many',
  UNDO_ONE = 'ngrx-data/undo-one',

  SET_CHANGE_STATE = 'ngrx-data/set-change-state',
  SET_COLLECTION = 'ngrx-data/set-collection',
  SET_FILTER = 'ngrx-data/set-filter',
  SET_LOADED = 'ngrx-data/set-loaded',
  SET_LOADING = 'ngrx-data/set-loading'
}
