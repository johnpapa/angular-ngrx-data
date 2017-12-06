import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { Store } from '@ngrx/store';

import { Hero } from '../../model';
import * as HeroActions from '../actions';
import * as fromHeroes from './hero.reducer';
import * as fromEntities from './entity.reducer';

export * from './hero.reducer';

export type Action = HeroActions.HeroAction;

// export const reducers: ActionReducerMap<fromEntities.EntityCollection<any>, Action> = {
export const reducers: ActionReducerMap<fromEntities.EntityCache> = {
  // TODO: for now the reducer must be named the same as the entity collection
  Hero: fromEntities.reducer // as fromEntities.EntityCollection<Hero>
  // here is where i put other reducers, when i have them
};
// export const reducers: ActionReducerMap<fromHeroes.EntityState> = {
//   // TODO: for now the reducer must be named the same as the entity collection
//   Hero: fromHeroes.reducer
//   // here is where i put other reducers, when i have them
// };
