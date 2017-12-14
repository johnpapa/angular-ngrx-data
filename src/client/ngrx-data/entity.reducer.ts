import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';

import { EntityAction, EntityOp } from './entity.actions';
import { EntityMetadata } from './entity-metadata';
import { EntityCollection, EntityDefinitions } from './entity-definition';
import { EntityDefinitionService } from './entity-definition.service';
import { EntityCache } from './interfaces'

export type EntityCollectionReducer<T> = (collection: EntityCollection<T>,
  action: EntityAction<T, any>) => EntityCollection<T>;

export interface EntityCollectionReducers {
  [entity: string]: EntityCollectionReducer<any>;
}

/** Create the reducer for the EntityCache */
export function createEntityReducer(
  entityDefinitionService: EntityDefinitionService) {

  let entityReducers:  EntityCollectionReducers = {};

  function initializeState() {
    entityReducers = entityDefinitionService.getAllEntityReducers();
    return entityDefinitionService.getAllInitialStates();
  }

  /** Perform Actions against the entity collections in the EntityCache */
  return function entityReducer(
    state: EntityCache,
    action: EntityAction<any, any>
  ): EntityCache {

    const entityName = action.entityName;
    if (!entityName) {
      return state; // not an EntityAction
    }

    if (!state || Object.keys(state).length === 0) {
      state = initializeState();
    }

    const collection = state[entityName];
    if (!collection) {
      throw new Error(`No cached collection named "${entityName}")`);
    }

    const reducer = entityReducers[entityName];
    if (!reducer) {
      throw new Error(`No reducer for collection named "${entityName}")`)
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
  return function entityCollectionReducer(
    collection: EntityCollection<T>,
    action: EntityAction<T, any>
  ): EntityCollection<T> {
    switch (action.op) {

      // Only the QUERY_ALL and QUERY_MANY methods set loading: true
      case EntityOp.QUERY_ALL:
      case EntityOp.QUERY_MANY: {
        return collection.loading ?
           collection : { ...collection, loading: true };
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
        return  collection.loading ?
          { ...collection, loading: false } : collection;
      }

      // Do nothing on other save errors.
      // The app should listen for those and do something.

      case EntityOp.QUERY_BY_KEY_SUCCESS: {
        const exists = !!collection.entities[metadata.selectId(action.payload)];
        const result = exists ?
          adapter.updateOne(action.payload, collection) :
          adapter.addOne(action.payload, collection)
        return result;
      }

      // pessimistic add; add entity only upon success
      case EntityOp.SAVE_ADD_SUCCESS: {
        return adapter.addOne(action.payload, collection);
      }

      // optimistic delete
      case EntityOp.SAVE_DELETE: {
        return adapter.removeOne(action.payload, collection);
      }

      // pessimistic update; update entity only upon success
      case EntityOp.SAVE_UPDATE_SUCCESS: {
        return adapter.updateOne(action.payload, collection);
      }

      // Cache-only operations

      case EntityOp.ADD_ALL: {
        return adapter.addAll(action.payload, collection)
      }

      case EntityOp.ADD_MANY: {
        return adapter.addMany(action.payload, collection)
      }

      case EntityOp.ADD_ONE: {
        return adapter.addOne(action.payload, collection)
      }

      case EntityOp.REMOVE_ALL: {
        return adapter.removeAll(collection)
      }

      case EntityOp.REMOVE_MANY: {
        return adapter.removeMany(action.payload, collection)
      }

      case EntityOp.REMOVE_ONE: {
        return adapter.removeOne(action.payload, collection)
      }

      case EntityOp.UPDATE_MANY: {
        return adapter.updateMany(action.payload, collection)
      }

      case EntityOp.UPDATE_ONE: {
        return adapter.updateOne(action.payload, collection)
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
