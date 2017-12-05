import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { Store } from '@ngrx/store';

import { Hero } from '../../model';
import * as HeroActions from '../actions';
import * as fromHeroes from './hero.reducer';

export type Action = HeroActions.HeroAction;

export interface HeroicState {
  heroes: fromHeroes.HeroState;
}

export const reducers: ActionReducerMap<HeroicState> = {
  heroes: fromHeroes.reducer
  // here is where i put other reducers, when i have them
};

// export const getHeroicState = createFeatureSelector<HeroicState>(
//   'heroic'
// );
