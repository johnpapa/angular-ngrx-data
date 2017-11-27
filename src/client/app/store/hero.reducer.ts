import { Hero } from '../model';
import * as HeroActions from './hero.action';

export interface HeroState {
  searchCriteria: string;
  heroes: Hero[];
  loading: boolean;
  error: boolean;
}

export const initialHeroState: HeroState = {
  searchCriteria: '',
  heroes: null,
  loading: false,
  error: false
};

export function heroReducer(heroState = initialHeroState, action: HeroActions.All): HeroState {
  console.log(heroState, action);

  switch (action.type) {
    case HeroActions.ADD_HERO: {
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

    case HeroActions.ADD_HERO_SUCCESS: {
      return {
        ...heroState,
        heroes: [
          ...heroState.heroes.filter(h => {
            return h.id !== 0;
          }),
          { ...action.payload }
        ]
      };
    }

    case HeroActions.GET_HEROES: {
      return { ...heroState, searchCriteria: action.payload, loading: true };
    }

    case HeroActions.GET_HEROES_SUCCESS: {
      return { ...heroState, heroes: action.payload, loading: false };
    }

    case HeroActions.DELETE_HERO: {
      const splicedHeroes = heroState.heroes.filter(h => h !== action.payload);
      return { ...heroState, heroes: heroState.heroes.filter(h => h !== action.payload) };
    }

    case HeroActions.DELETE_HERO_SUCCESS: {
      return heroState;
    }

    case HeroActions.DELETE_HERO_ERROR: {
      return { ...heroState, heroes: [...heroState.heroes, action.payload] };
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
  return {
    ...heroState,
    heroes: heroState.heroes.map(h => {
      if (h.id === heroChanges.id) {
        return { ...h, ...heroChanges };
      } else {
        return h;
      }
    })
  };
}
