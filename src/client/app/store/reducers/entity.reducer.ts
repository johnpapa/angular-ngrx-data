import { Hero } from '../../model';
import * as fromActions from '../actions';

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
  state = initialBaseState,
  action: fromActions.EntityAction<any, any>
): EntityCache {
  switch (action.type) {
    case fromActions.ADD: {
      return {
        // entire entity cache (heroes, villains, everything)
        ...state,
        // just the entity collection we want (this is the old state)
        [action.entityTypeName]: {
          // now we spread the existing state
          ...state[action.entityTypeName],
          // now we are merging in
          loading: true
        }
      };
    }

    case fromActions.ADD_SUCCESS: {
      return {
        ...state,
        [action.entityTypeName]: {
          ...state[action.entityTypeName],
          loading: false,
          entities: [...state[action.entityTypeName].entities, { ...action.payload }]
        }
      };
    }

    case fromActions.ADD_ERROR: {
      return {
        ...state,
        [action.entityTypeName]: {
          ...state[action.entityTypeName],
          loading: false
        }
      };
    }

    case fromActions.GET_FILTERED: {
      let filteredEntities: Hero[];
      if (state[action.entityTypeName].filter) {
        const filter = new RegExp(state[action.entityTypeName].filter, 'i');
        filteredEntities = state[action.entityTypeName].entities.filter(h => filter.test(h.name));
      } else {
        filteredEntities = state[action.entityTypeName].entities;
      }
      return {
        ...state,
        [action.entityTypeName]: {
          ...state[action.entityTypeName],
          loading: false,
          filteredEntities
        }
      };
    }

    case fromActions.GET_ALL: {
      return {
        ...state,
        [action.entityTypeName]: {
          ...state[action.entityTypeName],
          loading: true
        }
      };
    }

    case fromActions.GET_ALL_ERROR: {
      return {
        ...state,
        [action.entityTypeName]: {
          ...state[action.entityTypeName],
          loading: false
        }
      };
    }

    case fromActions.GET_ALL_SUCCESS: {
      return {
        ...state,
        [action.entityTypeName]: {
          ...state[action.entityTypeName],
          loading: false,
          entities: [action.payload]
        }
      };
    }

    case fromActions.SET_FILTER: {
      return { ...state, filter: action.payload };
    }

    case fromActions.DELETE: {
      return {
        ...state,
        [action.entityTypeName]: {
          ...state[action.entityTypeName],
          loading: true,
          entities: state[action.entityTypeName].entities.filter(h => h !== action.payload)
        }
      };
    }

    case fromActions.DELETE_SUCCESS: {
      return {
        ...state,
        [action.entityTypeName]: {
          ...state[action.entityTypeName],
          loading: false
        }
      };
    }

    case fromActions.DELETE_ERROR: {
      return {
        ...state,
        [action.entityTypeName]: {
          ...state[action.entityTypeName],
          entities: [...state[action.entityTypeName].entities, action.payload.requestData],
          loading: false
        }
      };
    }

    case fromActions.UPDATE: {
      return {
        ...state,
        [action.entityTypeName]: {
          ...state[action.entityTypeName],
          entities: state[action.entityTypeName].entities.map(h => {
            if (h.id === action.payload.id) {
              state[action.entityTypeName].loading = true;
            }
            return h;
          })
        }
      };
    }

    case fromActions.UPDATE_SUCCESS: {
      // return modifyHeroState(cache, action.payload);
      return {
        ...state,
        [action.entityTypeName]: {
          ...state[action.entityTypeName],
          loading: false,
          entities: state[action.entityTypeName].entities.map(h => {
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
        ...state,
        [action.entityTypeName]: {
          ...state[action.entityTypeName],
          loading: false,
          entities: state[action.entityTypeName].entities.map(h => {
            if (h.id === action.payload.requestData.id) {
              // Huh? No idea what the error is!
              state[action.entityTypeName].error = true;
            }
            return h;
          })
        }
      };
    }
  }
  return state;
}
