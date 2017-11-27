import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as HeroAction from './hero.action';
import * as reducers from './hero.reducer';
import { tap } from 'rxjs/operators';
import { Hero } from './hero';

export { Hero } from './hero';

@Injectable()
export class HeroService {
  constructor(private store: Store<reducers.State>) {}

  deleteHero(hero: Hero) {
    this.store.dispatch(new HeroAction.DeleteHero(hero));
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

  heroes$() {
    return this.store.select(state => state.hero.heroes).pipe(
      tap(heroes => {
        console.log('store', this.store);
        console.log('heroes', heroes);
      })
    );
  }
}
