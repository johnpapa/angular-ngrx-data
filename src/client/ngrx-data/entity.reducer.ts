import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';
import { IdSelector, Update } from './ngrx-entity-models';

import { EntityAction, EntityOp } from './entity.actions';
import { EntityMetadata } from './entity-metadata';
import { EntityCollection, EntityDefinitions } from './entity-definition';
import { EntityDefinitionService } from './entity-definition.service';
import { EntityCache } from './interfaces';

export type EntityCollectionReducer<T> = (
  collection: EntityCollection<T>,
  action: EntityAction<T, any>
) => EntityCollection<T>;

export interface EntityCollectionReducers {
  [entity: string]: EntityCollectionReducer<any>;
}

/** Create the reducer for the EntityCache */
export function createEntityReducer(entityDefinitionService: EntityDefinitionService) {
  const entityReducers: EntityCollectionReducers = {};

  /** Perform Actions against the entity collections in the EntityCache */
  return function entityReducer(
    state: EntityCache = {},
    action: EntityAction<any, any>
  ): EntityCache {
    const entityName = action.entityName;
    if (!entityName) {
      return state; // not an EntityAction
    }

    let collection = state[entityName];
    let reducer: EntityCollectionReducer<any>;
    if (collection) {
      reducer = entityReducers[entityName];
    } else {
      // Collection not in cache; create it from entity defs
      const def = entityDefinitionService.definitions[entityName];
      if (!def) {
        throw new Error(`The entity "${entityName}" type is not defined.`);
      }
      state = { ...state, [entityName]: (collection = def.initialState) };
      entityReducers[entityName] = reducer = def.reducer;
    }

    const newCollection = reducer(collection, action);

    return collection === newCollection ? state : { ...state, ...{ [entityName]: newCollection } };
  };
}

/** Create a reducer for a specific entity collection */
export function createEntityCollectionReducer<T>(
  entityName: string,
  adapter: EntityAdapter<T>,
  metadata: EntityMetadata<T>
) {
  /** Perform Actions against a particular entity collection in the EntityCache */

  const selectId = metadata.selectId;
  const toUpdate: (entity: T) => Update<T> = (entity: T) => ({
    id: selectId(entity) as string,
    changes: entity
  });

  return function entityCollectionReducer(
    collection: EntityCollection<T>,
    action: EntityAction<T, any>
  ): EntityCollection<T> {
    switch (action.op) {
      // Only the QUERY_ALL and QUERY_MANY methods set loading flag.
      case EntityOp.QUERY_ALL:
      case EntityOp.QUERY_MANY: {
        return collection.loading ? collection : { ...collection, loading: true };
      }

      case EntityOp.QUERY_ALL_SUCCESS: {
        return {
          ...adapter.addAll(action.payload, collection),
          loading: false
        };
      }

      case EntityOp.QUERY_MANY_SUCCESS: {
        return {
          ...adapter.addMany(action.payload, collection),
          loading: false
        };
      }

      case EntityOp.QUERY_ALL_ERROR:
      case EntityOp.QUERY_MANY_ERROR: {
        return collection.loading ? { ...collection, loading: false } : collection;
      }

      // Do nothing on other save errors.
      // The app should listen for those and do something.

      case EntityOp.QUERY_BY_KEY_SUCCESS: {
        const exists = !!collection.entities[metadata.selectId(action.payload)];
        const result = exists
          ? adapter.updateOne(action.payload, collection)
          : adapter.addOne(action.payload, collection);
        return result;
      }

      // pessimistic add; add entity only upon success
      case EntityOp.SAVE_ADD_SUCCESS: {
        return adapter.addOne(action.payload, collection);
      }

      // optimistic delete
      case EntityOp.SAVE_DELETE: {
        // payload assumed to be entity key
        return adapter.removeOne(action.payload, collection);
      }

      // pessimistic update; update entity only upon success
      case EntityOp.SAVE_UPDATE_SUCCESS: {
        // payload might be a partial of T but must at least have its key.
        // pass the Update<T> structure to adapter.updateOne
        const update: Update<T> = toUpdate(action.payload);
        return adapter.updateOne(update, collection);
      }

      // Cache-only operations

      case EntityOp.ADD_ALL: {
        return adapter.addAll(action.payload, collection);
      }

      case EntityOp.ADD_MANY: {
        return adapter.addMany(action.payload, collection);
      }

      case EntityOp.ADD_ONE: {
        return adapter.addOne(action.payload, collection);
      }

      case EntityOp.REMOVE_ALL: {
        return {
          ...adapter.removeAll(collection),
          loading: false
        };
      }

      case EntityOp.REMOVE_MANY: {
        // payload must be entity keys
        return adapter.removeMany(action.payload, collection);
      }

      case EntityOp.REMOVE_ONE: {
        // payload must be entity key
        return adapter.removeOne(action.payload, collection);
      }

      case EntityOp.UPDATE_MANY: {
        // payload could be partials of T but each must at least have its key.
        // pass the Update<T> structure to adapter.updateMany
        const update: Update<T>[] = (action.payload as T[]).map(entity => toUpdate(entity));
        return adapter.updateMany(update, collection);
      }

      case EntityOp.UPDATE_ONE: {
        // payload could be a partial of T but must at least have its key.
        // pass the Update<T> structure to adapter.updateOne
        const update: Update<T> = toUpdate(action.payload);
        return adapter.updateOne(update, collection);
      }

      case EntityOp.SET_FILTER: {
        return { ...collection, filter: action.payload };
      }

      default: {
        return collection;
      }
    }
  };
}
