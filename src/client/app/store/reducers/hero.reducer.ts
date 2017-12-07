import { Hero } from '../../core';
import * as HeroActions from '../actions';
import { ActionReducerMap } from '@ngrx/store';

import { EntityCache, EntityCollection } from '../ngrx-data';

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

// export function createReducer<A, E, S>(
//   state = initialBaseState.Hero,
//   action: HeroActions.All
// ): EntityCollection<E> {
//   return new EntityCollection<E>();
// }
// const foo = createReducer<HeroActions.All, Hero, HeroState>(
//   initialBaseState.Hero,
//   new HeroActions.GetHero('payload')
// );

export function reducer(state = initialBaseState.Hero, action: HeroActions.All): HeroState {
  switch (action.type) {
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

    case HeroActions.SET_HERO_FILTER: {
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

export type Action = HeroActions.HeroAction;

export const reducers: ActionReducerMap<EntityCache> = {
  // TODO: for now the reducer must be named the same as the entity collection
  Hero: reducer // as fromEntities.EntityCollection<Hero>
  // here is where i put other reducers, when i have them
};
// export const reducers: ActionReducerMap<fromHeroes.EntityCache> = {
//   // TODO: for now the reducer must be named the same as the entity collection
//   Hero: fromHeroes.reducer
//   // here is where i put other reducers, when i have them
// };
