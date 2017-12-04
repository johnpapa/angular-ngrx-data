import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector } from '@ngrx/store';
import * as HeroAction from './actions';
import { tap } from 'rxjs/operators';
import { Hero } from '../model';
import { AppState } from './reducers';

@Injectable()
export class HeroService {
  constructor(private store: Store<AppState>) {}

  // dispatchers
  deleteHero(hero: Hero) {
    this.store.dispatch(new HeroAction.DeleteHero(hero));
  }

  setFilter(filter: string) {
    this.store.dispatch(new HeroAction.SetFilter(filter));
  }

  saveHero(hero: Hero, mode: 'add' | 'update') {
    if (mode === 'add') {
      this.store.dispatch(new HeroAction.AddHero(hero));
    } else {
      this.store.dispatch(new HeroAction.UpdateHero(hero));
    }
  }

  getHeroes() {
    this.store.dispatch(new HeroAction.GetHeroes());
  }

  getFilteredHeroes(filter: string) {
    this.store.dispatch(new HeroAction.GetFilteredHeroes(filter));
  }

  // // selectors
  // export const getProductsState = createFeatureSelector<ProductsState>('products');
  // tslint:disable-next-line:member-ordering
  // getHeroesState = createFeatureSelector<AppState>('heroes');

  // // pizzas state
  // export const getPizzaState = createSelector(
  //   getProductsState,
  //   (state: ProductsState) => state.pizzas
  // );
  // tslint:disable-next-line:member-ordering
  // getHeroState = createSelector(this.getHeroesState, (state: AppState) => state.heroes);
  // export const getAllPizzas = createSelector(getPizzaState, fromPizzas.getPizzas);
  // tslint:disable-next-line:member-ordering
  // getHeroesFiltered = createSelector(this.getHeroesState, (state: AppState) => state.heroes.filteredHeroes);

  // observable selectors
  filteredHeroes$() {
    return this.store.select(state => state.heroes.filteredHeroes);
  }

  heroes$() {
    return this.store.select(state => state.heroes.heroes);
  }

  heroState$() {
    return this.store
      .select(state => state.heroes)
      .pipe(tap(heroState => console.log('heroState', heroState)));
  }

  loading$() {
    return this.store
      .select(state => state.heroes.loading)
      .pipe(tap(loading => console.log('loading', loading)));
  }

  filter$() {
    return this.store
      .select(state => state.heroes.filter)
      .pipe(tap(filter => console.log('filter', filter)));
  }
}
