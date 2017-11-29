import { Hero } from '../model';
import * as HeroActions from './hero.action';

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

export function heroReducer(heroState = initialHeroState, action: HeroActions.All): HeroState {
  switch (action.type) {
    case HeroActions.ADD_HERO: {
      return { ...heroState, loading: true };
    }

    case HeroActions.ADD_HERO_SUCCESS: {
      const result = {
        ...heroState,
        loading: false,
        heroes: [...heroState.heroes, { ...action.payload }]
      };
      result.filteredHeroes = [...filterHeroes(result.heroes, heroState.filter)];
      return result;
    }

    case HeroActions.ADD_HERO_ERROR: {
      return { ...heroState, loading: false };
    }

    case HeroActions.GET_FILTERED_HEROES: {
      const result = {
        ...heroState,
        filteredHeroes: [
          ...heroState.heroes.filter(h => new RegExp(heroState.filter, 'i').test(h.name))
        ]
      };
      return result;
    }

    case HeroActions.GET_HEROES: {
      // case HeroActions.SEARCH_HEROES: {
      return { ...heroState, loading: true };
    }

    case HeroActions.GET_HEROES_SUCCESS: {
      // case HeroActions.SEARCH_HEROES_SUCCESS:
      return {
        ...heroState,
        heroes: action.payload,
        filteredHeroes: [...filterHeroes(action.payload, heroState.filter)],
        loading: false
      };
    }

    case HeroActions.SET_FILTER: {
      return { ...heroState, filter: action.payload };
    }

    case HeroActions.DELETE_HERO: {
      const splicedHeroes = heroState.heroes.filter(h => h !== action.payload);
      return {
        ...heroState,
        loading: true,
        heroes: heroState.heroes.filter(h => h !== action.payload)
      };
    }

    case HeroActions.DELETE_HERO_SUCCESS: {
      const result = { ...heroState, loading: false };
      result.filteredHeroes = [...filterHeroes(result.heroes, heroState.filter)];
      return result;
    }

    case HeroActions.DELETE_HERO_ERROR: {
      return { ...heroState, loading: false, heroes: [...heroState.heroes, action.payload] };
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
          if (h.id === action.payload.id) {
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
  const result = {
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
  result.filteredHeroes = [...filterHeroes(result.heroes, heroState.filter)];
  return result;
}

function filterHeroes(payload: Hero[], filter: string) {
  return payload.filter(h => new RegExp(filter, 'i').test(h.name));
}
