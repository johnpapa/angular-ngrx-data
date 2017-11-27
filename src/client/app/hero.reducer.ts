import { Hero } from './hero';
import * as HeroActions from './hero.action';

export interface HeroState {
  heroes: Hero[];
  loading: boolean;
  error: boolean;
}

export const initialHeroState: HeroState = {
  heroes: null,
  loading: false,
  error: false
};

export type Action = HeroActions.All;

export interface State {
  hero: HeroState;
}

export const reducers = {
  hero: heroReducer
};

export function selectHeroes(state: State) {
  return state.hero.heroes;
}

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
      const msg = { ...heroState, loading: true };
      console.log('GET_HEROES ...');
      console.log(msg);
      return msg;
    }

    case HeroActions.GET_HEROES_SUCCESS: {
      const msg = { ...heroState, heroes: action.payload, loading: false };
      console.log('GET_HEROES_SUCCESS');
      console.log(msg);
      return msg;
    }

    case HeroActions.DELETE_HERO: {
      const splicedHeroes = heroState.heroes.filter(h => h !== action.payload);
      const msg = { ...heroState, heroes: heroState.heroes.filter(h => h !== action.payload) };
      return msg;
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
      return modifyHeroState(heroState, action.payload, {});
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

function modifyHeroState(heroState: HeroState, hero: Hero, modifications): HeroState {
  return {
    ...heroState,
    heroes: heroState.heroes.map(h => {
      if (h.id === hero.id) {
        return { ...h, ...hero, ...modifications };
      } else {
        return h;
      }
    })
  };
}
