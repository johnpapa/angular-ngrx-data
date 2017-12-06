import { Hero } from '../../model';
import * as HeroActions from '../actions';

export interface EntityState {
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

export const initialBaseState: EntityState = {
  // TODO: for now we need to name the entity entries/collections the same as the model
  Hero: new EntityCollection<Hero>(),
  Villain: new EntityCollection<Hero>() // TODO no villain exists
};

// export const initialState: HeroState = {
//   filter: '',
//   entities: [],
//   filteredEntities: [],
//   loading: false,
//   error: false
// };

// let state2: BaseState = { ...initialBaseState, ...{ hero: new EntityEntry<Hero>() } };
// state2 = { ...state2, ...{ villain: new EntityEntry<Hero>() } };
// state2 = { ...state2, ...{ hero: initialState } };
// console.log(JSON.stringify(state2));

export function reducer(state = initialBaseState.Hero, action: HeroActions.All): HeroState {
  // export function reducer(state = initialState, action: HeroActions.EntityAction<Hero, any>): HeroState {
  switch (action.type) {
    // case HeroActions.EntityOpType.ADD_HERO: {
    case HeroActions.ADD_HERO: {
      return { ...state, loading: true };
    }

    case HeroActions.ADD_HERO_SUCCESS: {
      return {
        ...state,
        loading: false,
        entities: [...state.entities, { ...action.payload }]
      };
    }

    case HeroActions.ADD_HERO_ERROR: {
      return { ...state, loading: false };
    }

    case HeroActions.GET_FILTERED_HEROES: {
      let filteredEntities: Hero[];
      if (state.filter) {
        const filter = new RegExp(state.filter, 'i');
        filteredEntities = state.entities.filter(h => filter.test(h.name));
      } else {
        filteredEntities = state.entities;
      }
      return { ...state, filteredEntities };
    }

    case HeroActions.GET_HEROES: {
      return { ...state, loading: true };
    }

    case HeroActions.GET_HEROES_ERROR: {
      return {
        ...state,
        loading: false
      };
    }

    case HeroActions.GET_HEROES_SUCCESS: {
      return {
        ...state,
        entities: action.payload,
        loading: false
      };
    }

    case HeroActions.SET_FILTER: {
      return { ...state, filter: action.payload };
    }

    case HeroActions.DELETE_HERO: {
      return {
        ...state,
        loading: true,
        entities: state.entities.filter(h => h !== action.payload)
      };
    }

    case HeroActions.DELETE_HERO_SUCCESS: {
      const result = { ...state, loading: false };
      return result;
    }

    case HeroActions.DELETE_HERO_ERROR: {
      return {
        ...state,
        entities: [...state.entities, action.payload.requestData],
        loading: false
      };
    }

    case HeroActions.UPDATE_HERO: {
      return {
        ...state,
        entities: state.entities.map(h => {
          if (h.id === action.payload.id) {
            state.loading = true;
          }
          return h;
        })
      };
    }

    case HeroActions.UPDATE_HERO_SUCCESS: {
      return modifyHeroState(state, action.payload);
    }

    case HeroActions.UPDATE_HERO_ERROR: {
      return {
        ...state,
        loading: false,
        entities: state.entities.map(h => {
          if (h.id === action.payload.requestData.id) {
            // Huh? No idea what the error is!
            state.error = true;
          }
          return h;
        })
      };
    }
  }
  return state;
}

function modifyHeroState(heroState: HeroState, heroChanges: Partial<Hero>): HeroState {
  return {
    ...heroState,
    loading: false,
    entities: heroState.entities.map(h => {
      if (h.id === heroChanges.id) {
        return { ...h, ...heroChanges };
      } else {
        return h;
      }
    })
  };
}
