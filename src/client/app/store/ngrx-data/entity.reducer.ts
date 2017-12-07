import { Action, ActionReducerMap } from '@ngrx/store';

import { Hero } from '../../model';
import * as Actions from './entity.actions';
import { EntityCache, EntityCollection } from './interfaces';

export const reducers: ActionReducerMap<{[name: string]: EntityCache}> = {
  EntityCache: reducer // as fromEntities.EntityCollection<Hero>
};

// TODO: For diagnostics would be great if could nest collections such
// that the redux tool saw the entity actions, collections, reducers, etc.
// independently of the cache.
// Still want the cache object because (a) avoid collection name collisions and
// (b) some operations will surely apply across the cache.

export function reducer(
  state: EntityCache = {},
  action: Actions.EntityAction<any, any>
): EntityCache {
  const entityTypeName = action.entityTypeName;
  const collection = state[entityTypeName];
  // TODO: consider creating a collection if none exists.
  //       Worried now that later implementation would depend upon
  //       missing collection metadata.
  if (!collection) {
    throw new Error(`Entity collection ${entityTypeName} not found in cache)`);
  }
  // Todo: intercept and redirect to entity-specific reducer
  const newCollection = entityCollectionReducer(collection, action);
  return (collection === newCollection) ? state :
    {...state, ...{ [entityTypeName]: collection } };
}

function entityCollectionReducer<T>(
  collection: EntityCollection<T>,
  action: Actions.EntityAction<T, any>): EntityCollection<T> {

  switch (action.type) {
    case Actions.ADD: {
      return { ...collection, loading: true };
    }

    case Actions.ADD_SUCCESS: {
      return {
        ...collection,
        loading: false,
        entities: [...collection.entities, { ...action.payload }]
      };
    }

    case Actions.ADD_ERROR: {
      return { ...collection, loading: false };
    }

    case Actions.GET_ALL: {
      return { ...collection, loading: true };
    }

    case Actions.GET_ALL_ERROR: {
      return {
        ...collection,
        loading: false
      };
    }

    case Actions.GET_ALL_SUCCESS: {
      return {
        ...collection,
        entities: action.payload,
        loading: false
      };
    }

    case Actions.DELETE: {
      return {
        ...collection,
        loading: true,
        entities: collection.entities.filter(h => h !== action.payload)
      };
    }

    case Actions.DELETE_SUCCESS: {
      const result = { ...collection, loading: false };
      return result;
    }

    case Actions.DELETE_ERROR: {
      return {
        ...collection,
        entities: [...collection.entities, action.payload.requestData],
        loading: false
      };
    }

    case Actions.UPDATE: {
      return {
        ...collection,
        entities: collection.entities.map((entity: any) => {
          if (entity.id === action.payload.id) {
            collection.loading = true;
          }
          return entity;
        })
      };
    }

    case Actions.UPDATE_SUCCESS: {
      return {
        ...collection,
        loading: false,
        entities: collection.entities.map((entity: any) => {
          if (entity.id === action.payload.id) {
            return Object.assign({}, entity, action.payload);
            // return { ...entity, ...action.payload }; // TS hates this
          } else {
            return entity;
          }
        })
      };    }

    case Actions.UPDATE_ERROR: {
      return {
        ...collection,
        loading: false,
        entities: collection.entities.map((entity: any) => {
          if (entity.id === action.payload.requestData.id) {
            // Huh? No idea what the error is!
            collection.error = true;
          }
          return entity;
        })
      };
    }

    case Actions.GET_FILTERED: {
      let filteredEntities: T[];
      if (collection.filter) {
        const filter = new RegExp(collection.filter, 'i');
        filteredEntities = collection.entities
          .filter((entity: any) => filter.test(entity.name));
      } else {
        filteredEntities = collection.entities;
      }
      return { ...collection, filteredEntities };
    }

    case Actions.SET_FILTER: {
      return { ...collection, filter: action.payload };
    }

    default: {
      return collection;
    }
  }
}
