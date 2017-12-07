import { Hero } from '../../model';
import * as Actions from '../actions';
import { Action, ActionReducerMap } from '@ngrx/store';

export interface EntityCache {
  // Must be any since we don't know what type of collections we will have
  [name: string]: EntityCollection<any>;
}

export class EntityCollection<T> {
  filter = '';
  entities: T[] = [];
  filteredEntities: T[] = [];
  loading = false;
  error = false;
}

export const initialBaseState: EntityCache = {
  // TODO: for now we need to name the entity entries/collections the same as the model
  Hero: new EntityCollection<Hero>(),
  Villain: new EntityCollection<Hero>() // TODO no villain exists
};

export const reducers: ActionReducerMap<{[name: string]: EntityCache}> = {
  EntityCache: reducer // as fromEntities.EntityCollection<Hero>
};

export function reducer(
  state = initialBaseState,
  action: Actions.EntityAction<any, any>
): EntityCache {
  const entityTypeName = action.entityTypeName;
  const collection = state[entityTypeName];
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
