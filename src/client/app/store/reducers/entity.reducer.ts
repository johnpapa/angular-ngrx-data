import { Hero } from '../../model';
import * as fromActions from '../actions';
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

export function reducer(
  state = initialBaseState,
  action: Action
): EntityCache {
  const entityAction = action as fromActions.EntityAction<any, any>
  switch (entityAction.type) {
    case fromActions.ADD: {
      return {
        // entire entity cache (heroes, villains, everything)
        ...state,
        // just the entity collection we want (this is the old state)
        [entityAction.entityTypeName]: {
          // now we spread the existing state
          ...state[entityAction.entityTypeName],
          // now we are merging in
          loading: true
        }
      };
    }

    case fromActions.ADD_SUCCESS: {
      return {
        ...state,
        [entityAction.entityTypeName]: {
          ...state[entityAction.entityTypeName],
          loading: false,
          entities: [...state[entityAction.entityTypeName].entities, { ...entityAction.payload }]
        }
      };
    }

    case fromActions.ADD_ERROR: {
      return {
        ...state,
        [entityAction.entityTypeName]: {
          ...state[entityAction.entityTypeName],
          loading: false
        }
      };
    }

    case fromActions.GET_FILTERED: {
      let filteredEntities: Hero[];
      if (state[entityAction.entityTypeName].filter) {
        const filter = new RegExp(state[entityAction.entityTypeName].filter, 'i');
        filteredEntities = state[entityAction.entityTypeName].entities.filter(h => filter.test(h.name));
      } else {
        filteredEntities = state[entityAction.entityTypeName].entities;
      }
      return {
        ...state,
        [entityAction.entityTypeName]: {
          ...state[entityAction.entityTypeName],
          loading: false,
          filteredEntities
        }
      };
    }

    case fromActions.GET_ALL: {
      return {
        ...state,
        [entityAction.entityTypeName]: {
          ...state[entityAction.entityTypeName],
          loading: true
        }
      };
    }

    case fromActions.GET_ALL_ERROR: {
      return {
        ...state,
        [entityAction.entityTypeName]: {
          ...state[entityAction.entityTypeName],
          loading: false
        }
      };
    }

    case fromActions.GET_ALL_SUCCESS: {
      return {
        ...state,
        [entityAction.entityTypeName]: {
          ...state[entityAction.entityTypeName],
          loading: false,
          entities: [entityAction.payload]
        }
      };
    }

    case fromActions.SET_FILTER: {
      return { ...state, filter: entityAction.payload };
    }

    case fromActions.DELETE: {
      return {
        ...state,
        [entityAction.entityTypeName]: {
          ...state[entityAction.entityTypeName],
          loading: true,
          entities: state[entityAction.entityTypeName].entities.filter(h => h !== entityAction.payload)
        }
      };
    }

    case fromActions.DELETE_SUCCESS: {
      return {
        ...state,
        [entityAction.entityTypeName]: {
          ...state[entityAction.entityTypeName],
          loading: false
        }
      };
    }

    case fromActions.DELETE_ERROR: {
      return {
        ...state,
        [entityAction.entityTypeName]: {
          ...state[entityAction.entityTypeName],
          entities: [...state[entityAction.entityTypeName].entities, entityAction.payload.requestData],
          loading: false
        }
      };
    }

    case fromActions.UPDATE: {
      return {
        ...state,
        [entityAction.entityTypeName]: {
          ...state[entityAction.entityTypeName],
          entities: state[entityAction.entityTypeName].entities.map(h => {
            if (h.id === entityAction.payload.id) {
              state[entityAction.entityTypeName].loading = true;
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
        [entityAction.entityTypeName]: {
          ...state[entityAction.entityTypeName],
          loading: false,
          entities: state[entityAction.entityTypeName].entities.map(h => {
            if (h.id === entityAction.payload.id) {
              return { ...h, ...entityAction.payload };
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
        [entityAction.entityTypeName]: {
          ...state[entityAction.entityTypeName],
          loading: false,
          entities: state[entityAction.entityTypeName].entities.map(h => {
            if (h.id === entityAction.payload.requestData.id) {
              // Huh? No idea what the error is!
              state[entityAction.entityTypeName].error = true;
            }
            return h;
          })
        }
      };
    }
  }
  return state;
}


export const reducers: ActionReducerMap<{[name: string]: EntityCache}> = {
  EntityCache: reducer // as fromEntities.EntityCollection<Hero>
};
