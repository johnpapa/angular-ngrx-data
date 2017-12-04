import { Hero } from '../../model';
import * as HeroActions from '../actions';

export interface HeroState {
  filter: string;
  heroes: Hero[];
  filteredHeroes: Hero[];
  loading: boolean;
  error: boolean;
}

export const initialHeroState: HeroState = {
  filter: '',
  heroes: [],
  filteredHeroes: [],
  loading: false,
  error: false
};

export function reducer(
  heroState = initialHeroState,
  action: HeroActions.HeroAction
): HeroState {
  switch (action.type) {
    case HeroActions.ADD_HERO: {
      return { ...heroState, loading: true };
    }

    case HeroActions.ADD_HERO_SUCCESS: {
      return {
        ...heroState,
        loading: false,
        heroes: [...heroState.heroes, { ...action.payload }]
      };
    }

    case HeroActions.ADD_HERO_ERROR: {
      return { ...heroState, loading: false };
    }

    case HeroActions.SET_FILTERED_HEROES: {
      return {
        ...heroState,
        filteredHeroes: heroState.heroes.filter(h => new RegExp(heroState.filter, 'i').test(h.name))
      };
    }

    case HeroActions.GET_HEROES: {
      return { ...heroState, loading: true };
    }

    case HeroActions.GET_HEROES_SUCCESS: {
      return {
        ...heroState,
        heroes: action.payload,
        loading: false
      };
    }

    case HeroActions.SET_FILTER: {
      return { ...heroState, filter: action.payload };
    }

    case HeroActions.DELETE_HERO: {
      return {
        ...heroState,
        loading: true,
        heroes: heroState.heroes.filter(h => h !== action.payload)
      };
    }

    case HeroActions.DELETE_HERO_SUCCESS: {
      const result = { ...heroState, loading: false };
      return result;
    }

    case HeroActions.DELETE_HERO_ERROR: {
      return {
        ...heroState,
        heroes: [...heroState.heroes, action.payload.requestData],
        loading: false
      };
    }

    case HeroActions.UPDATE_HERO: {
      return {
        ...heroState,
        heroes: heroState.heroes.map(h => {
          if (h.id === action.payload.id) {
            heroState.loading = true;
          }
          return h;
        })
      };
    }

    case HeroActions.UPDATE_HERO_SUCCESS: {
      return modifyHeroState(heroState, action.payload);
    }

    case HeroActions.UPDATE_HERO_ERROR: {
      return {
        ...heroState,
        loading: false,
        heroes: heroState.heroes.map(h => {
          if (h.id === action.payload.requestData.id) {
            // Huh? No idea what the error is!
            heroState.error = true;
          }
          return h;
        })
      };
    }

    default: {
      return heroState;
    }
  }
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
