import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as HeroAction from './hero.action';
import { tap } from 'rxjs/operators';
import { Hero } from '../model';
import { State } from './reducers';

@Injectable()
export class HeroService {
  constructor(private store: Store<State>) {}

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

  filteredHeroes$() {
    return this.store.select(state => state.hero.filteredHeroes);
  }

  heroes$() {
    return this.store.select(state => state.hero.heroes);
  }

  heroState$() {
    return this.store
      .select(state => state.hero)
      .pipe(tap(heroState => console.log('heroState', heroState)));
  }

  loading$() {
    return this.store
      .select(state => state.hero.loading)
      .pipe(tap(loading => console.log('loading', loading)));
  }

  filter$() {
    return this.store
      .select(state => state.hero.filter)
      .pipe(tap(filter => console.log('filter', filter)));
  }
}
