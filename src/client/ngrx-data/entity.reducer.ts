import { Action } from '@ngrx/store';

import * as EntityActions from './entity.actions';
import { EntityAction, EntityCache, EntityCollection } from './interfaces';

export function entityReducer(
  state: EntityCache = {},
  action: EntityAction<any, any>
): EntityCache {
  const entityName = action.entityName;
  if (!entityName) {
    return state; // not an EntityAction
  }

  const collection = state[entityName];
  // TODO: consider creating a collection if none exists.
  //       Worried now that later implementation would depend upon
  //       missing collection metadata.
  if (!collection) {
    throw new Error(`No cached collection named "${entityName}")`);
  }

  // Todo: intercept and redirect if there's a custom entity reducer
  const newCollection = entityCollectionReducer(collection, action);
  return collection === newCollection
    ? state
    : { ...state, ...{ [entityName]: newCollection } };
}

function entityCollectionReducer<T>(
  collection: EntityCollection<T>,
  action: EntityAction<T, any>
): EntityCollection<T> {
  switch (action.op) {
      case EntityActions.ADD_SUCCESS: {
      // pessimistic add; add entity only upon success
      return {
        ...collection,
        entities: [...collection.entities, { ...action.payload }]
      };
    }

    case EntityActions.GET_ALL_SUCCESS: {
      return {
        ...collection,
        entities: action.payload
      };
    }

    case EntityActions._DELETE_BY_INDEX: {
      // optimistic deletion
      const ix: number = action.payload.index;
      return (ix == null || ix < 0) ? collection :
        {
        ...collection,
        entities: collection.entities.slice(0, ix)
          .concat(collection.entities.slice(ix + 1))
        };
    }

    case EntityActions._DELETE_ERROR: {
      // When delete-to-server fails
      // restore deleted entity to list (if it was known to be in the list)
      const payload = action.payload.originalAction.payload;
      const ix: number = payload.index;
      return (ix == null || ix < 0 || !payload.entity) ? collection :
      {
      ...collection,
      entities: collection.entities.slice(0, ix).concat(
          payload.entity,
          collection.entities.slice(ix + 1)
        )
      };
    }

    case EntityActions.UPDATE_SUCCESS: {
      // pessimistic update; update entity only upon success
      return {
        ...collection,
        entities: collection.entities.map((entity: any) => {
          return entity.id === action.payload.id
            ? { ...entity, ...action.payload } // merge changes
            : entity;
        })
      };
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

    case EntityActions.SET_LOADING: {
      return { ...collection, loading: action.payload };
    }

    default: {
      return collection;
    }
  }
}
