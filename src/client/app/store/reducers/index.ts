import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { Store } from '@ngrx/store';

import { Hero } from '../../model';
import * as HeroActions from '../actions';
import * as fromHeroes from './hero.reducer';

export type Action = HeroActions.HeroAction;

export interface AppState {
  heroes: fromHeroes.HeroState;
}

export const reducers: ActionReducerMap<AppState> = {
  heroes: fromHeroes.reducer
  // here is where i put other reducers, when i have them
};

// export const getHeroes = (state: HeroState) => state.heroes;

// export interface ProductsState {
//   pizzas: fromPizzas.PizzaState;
// }

// export const reducers: ActionReducerMap<ProductsState> = {
//   pizzas: fromPizzas.reducer
// };

// // selectors
// export const getProductsState = createFeatureSelector<ProductsState>('products');

// // pizzas state
// export const getPizzaState = createSelector(
//   getProductsState,
//   (state: ProductsState) => state.pizzas
// );

// export const getAllPizzas = createSelector(getPizzaState, fromPizzas.getPizzas);
// export const getAllPizzasLoaded = createSelector(getPizzaState, fromPizzas.getPizzasLoaded);
// export const getAllPizzasLoading = createSelector(getPizzaState, fromPizzas.getPizzasLoading);
