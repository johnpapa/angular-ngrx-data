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

  setSearchCriteria(criteria: string) {
    this.store.dispatch(new HeroAction.SetSearchCriteria(criteria));
  }

  saveHero(hero: Hero, mode: 'add' | 'update') {
    if (mode === 'add') {
      this.store.dispatch(new HeroAction.AddHero(hero));
    } else {
      this.store.dispatch(new HeroAction.UpdateHero(hero));
    }
  }

  getHeroes(criteria: string) {
    this.store.dispatch(new HeroAction.GetHeroes(criteria));
  }

  heroes$() {
    return this.store
      .select(state => state.hero.heroes)
      .pipe(tap(heroes => console.log('heroes', heroes)));
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

  searchCriteria$() {
    return this.store
      .select(state => state.hero.searchCriteria)
      .pipe(tap(searchCriteria => console.log('searchCriteria', searchCriteria)));
  }
}
