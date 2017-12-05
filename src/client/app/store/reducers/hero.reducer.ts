import { Hero } from '../../model';
import * as HeroActions from '../actions';

export interface HeroState {
  filter: string;
  heroes: Hero[];
  filteredHeroes: Hero[];
  loading: boolean;
  error: boolean;
}

export const initialState: HeroState = {
  filter: '',
  heroes: [],
  filteredHeroes: [],
  loading: false,
  error: false
};

export function reducer(state = initialState, action: HeroActions.All): HeroState {
  switch (action.type) {
    case HeroActions.ADD_HERO: {
      return { ...state, loading: true };
    }

    case HeroActions.ADD_HERO_SUCCESS: {
      return {
        ...state,
        loading: false,
        heroes: [...state.heroes, { ...action.payload }]
      };
    }

    case HeroActions.ADD_HERO_ERROR: {
      return { ...state, loading: false };
    }

    case HeroActions.GET_FILTERED_HEROES: {
      return {
        ...state,
        filteredHeroes: state.heroes.filter(h => new RegExp(state.filter, 'i').test(h.name))
      };
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
        heroes: action.payload,
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
        heroes: state.heroes.filter(h => h !== action.payload)
      };
    }

    case HeroActions.DELETE_HERO_SUCCESS: {
      const result = { ...state, loading: false };
      return result;
    }

    case HeroActions.DELETE_HERO_ERROR: {
      return {
        ...state,
        heroes: [...state.heroes, action.payload.requestData],
        loading: false
      };
    }

    case HeroActions.UPDATE_HERO: {
      return {
        ...state,
        heroes: state.heroes.map(h => {
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
        heroes: state.heroes.map(h => {
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
    heroes: heroState.heroes.map(h => {
      if (h.id === heroChanges.id) {
        return { ...h, ...heroChanges };
      } else {
        return h;
      }
    })
  };
}
