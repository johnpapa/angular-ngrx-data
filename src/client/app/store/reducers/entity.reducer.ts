import { Hero } from '../../model';
import * as fromActions from '../actions';
import { Action } from '@ngrx/store';

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

export interface HeroState extends EntityCollection<Hero> {
  filter: string;
  entities: Hero[];
  filteredEntities: Hero[];
  loading: boolean;
  error: boolean;
}

export const initialBaseState: EntityCache = {
  // TODO: for now we need to name the entity entries/collections the same as the model
  Hero: new EntityCollection<Hero>(),
  Villain: new EntityCollection<Hero>() // TODO no villain exists
};

export function reducer(
  cache = initialBaseState,
  action: fromActions.EntityAction<any, any>
): EntityCache {
  switch (action.type) {
    case fromActions.ADD: {
      return {
        // entire entity cache (heroes, villains, everything)
        ...cache,
        // just the entity collection we want (this is the old state)
        [action.entityTypeName]: {
          // now we spread the existing state
          ...cache[action.entityTypeName],
          // now we are merging in
          loading: true
        }
      };
    }

    case fromActions.ADD_SUCCESS: {
      return {
        ...cache,
        [action.entityTypeName]: {
          ...cache[action.entityTypeName],
          loading: false,
          entities: [...cache[action.entityTypeName].entities, { ...action.payload }]
        }
      };
    }

    case fromActions.ADD_ERROR: {
      return {
        ...cache,
        [action.entityTypeName]: {
          ...cache[action.entityTypeName],
          loading: false
        }
      };
    }

    case fromActions.GET_FILTERED: {
      let filteredEntities: Hero[];
      if (cache[action.entityTypeName].filter) {
        const filter = new RegExp(cache[action.entityTypeName].filter, 'i');
        filteredEntities = cache[action.entityTypeName].entities.filter(h => filter.test(h.name));
      } else {
        filteredEntities = cache[action.entityTypeName].entities;
      }
      return {
        ...cache,
        [action.entityTypeName]: {
          ...cache[action.entityTypeName],
          loading: false,
          filteredEntities
        }
      };
    }

    case fromActions.GET_ALL: {
      return {
        ...cache,
        [action.entityTypeName]: {
          ...cache[action.entityTypeName],
          loading: true
        }
      };
    }

    case fromActions.GET_ALL_ERROR: {
      return {
        ...cache,
        [action.entityTypeName]: {
          ...cache[action.entityTypeName],
          loading: false
        }
      };
    }

    case fromActions.GET_ALL_SUCCESS: {
      return {
        ...cache,
        [action.entityTypeName]: {
          ...cache[action.entityTypeName],
          loading: false,
          entities: [action.payload]
        }
      };
    }

    case fromActions.SET_FILTER: {
      return { ...cache, filter: action.payload };
    }

    case fromActions.DELETE: {
      return {
        ...cache,
        [action.entityTypeName]: {
          ...cache[action.entityTypeName],
          loading: true,
          entities: cache[action.entityTypeName].entities.filter(h => h !== action.payload)
        }
      };
    }

    case fromActions.DELETE_SUCCESS: {
      return {
        ...cache,
        [action.entityTypeName]: {
          ...cache[action.entityTypeName],
          loading: false
        }
      };
    }

    case fromActions.DELETE_ERROR: {
      return {
        ...cache,
        [action.entityTypeName]: {
          ...cache[action.entityTypeName],
          entities: [...cache[action.entityTypeName].entities, action.payload.requestData],
          loading: false
        }
      };
    }

    case fromActions.UPDATE: {
      return {
        ...cache,
        [action.entityTypeName]: {
          ...cache[action.entityTypeName],
          entities: cache[action.entityTypeName].entities.map(h => {
            if (h.id === action.payload.id) {
              cache[action.entityTypeName].loading = true;
            }
            return h;
          })
        }
      };
    }

    case fromActions.UPDATE_SUCCESS: {
      // return modifyHeroState(cache, action.payload);
      return {
        ...cache,
        [action.entityTypeName]: {
          ...cache[action.entityTypeName],
          loading: false,
          entities: cache[action.entityTypeName].entities.map(h => {
            if (h.id === action.payload.id) {
              return { ...h, ...action.payload };
            } else {
              return h;
            }
          })
        }
      };
    }

    case fromActions.UPDATE_ERROR: {
      return {
        ...cache,
        [action.entityTypeName]: {
          ...cache[action.entityTypeName],
          loading: false,
          entities: cache[action.entityTypeName].entities.map(h => {
            if (h.id === action.payload.requestData.id) {
              // Huh? No idea what the error is!
              cache[action.entityTypeName].error = true;
            }
            return h;
          })
        }
      };
    }
  }
  return cache;
}
