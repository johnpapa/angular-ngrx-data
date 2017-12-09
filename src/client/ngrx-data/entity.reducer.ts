import { Action } from '@ngrx/store';

import * as EntityActions from './entity.actions';
import { EntityAction, EntityCache, EntityCollection } from './interfaces';

export function entityReducer(
  state: EntityCache = {},
  action: EntityAction<any, any>
): EntityCache {
  const entityTypeName = action.entityTypeName;
  if (!entityTypeName) {
    return state; // not an EntityAction
  }

  const collection = state[entityTypeName];
  // TODO: consider creating a collection if none exists.
  //       Worried now that later implementation would depend upon
  //       missing collection metadata.
  if (!collection) {
    throw new Error(`No cached collection named "${entityTypeName}")`);
  }

  // Todo: intercept and redirect if there's a custom entity reducer
  const newCollection = entityCollectionReducer(collection, action);
  return collection === newCollection
    ? state
    : { ...state, ...{ [entityTypeName]: newCollection } };
}

function entityCollectionReducer<T>(
  collection: EntityCollection<T>,
  action: EntityAction<T, any>
): EntityCollection<T> {
  switch (action.op) {
    case EntityActions.ADD: {
      // pessimistic add; add it only upon success
      return { ...collection, loading: true };
    }

    case EntityActions.ADD_SUCCESS: {
      return {
        ...collection,
        entities: [...collection.entities, { ...action.payload }],
        loading: false
      };
    }

    case EntityActions.ADD_ERROR: {
      return { ...collection, loading: false };
    }

    case EntityActions.GET_ALL: {
      return { ...collection, loading: true };
    }

    case EntityActions.GET_ALL_ERROR: {
      return { ...collection, loading: false };
    }

    case EntityActions.GET_ALL_SUCCESS: {
      return {
        ...collection,
        entities: action.payload,
        loading: false
      };
    }

    case EntityActions.DELETE: {
      return {
        ...collection,
        // optimistic deletion
        entities: collection.entities.filter(h => h !== action.payload),
        loading: true
      };
    }

    case EntityActions.DELETE_SUCCESS: {
      return { ...collection, loading: false };
    }

    case EntityActions.DELETE_ERROR: {
      return {
        ...collection,
        // compensate by restoring deleted entity
        entities: [...collection.entities, action.payload.requestData],
        loading: false
      };
    }

    case EntityActions.UPDATE: {
      return { ...collection, loading: true };
    }

    case EntityActions.UPDATE_SUCCESS: {
      return {
        ...collection,
        // pessimistic add
        entities: collection.entities.map((entity: any) => {
          return entity.id === action.payload.id
            ? { ...entity, ...action.payload } // merge changes
            : entity;
        }),
        loading: false
      };
    }

    case EntityActions.UPDATE_ERROR: {
      return { ...collection, loading: false };
    }

    case EntityActions.GET_FILTERED: {
      let filteredEntities: T[];
      if (collection.filter) {
        const filter = new RegExp(collection.filter, 'i');
        filteredEntities = collection.entities.filter((entity: any) => filter.test(entity.name));
      } else {
        filteredEntities = collection.entities;
      }
      return { ...collection, filteredEntities };
    }

    case EntityActions.SET_FILTER: {
      return { ...collection, filter: action.payload };
    }

    default: {
      return collection;
    }
  }
}
