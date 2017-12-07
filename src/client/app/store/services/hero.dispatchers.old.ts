import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { Hero } from '../../model';
import * as HeroAction from '../actions';
import { EntityCache } from '../ngrx-data';

@Injectable()
export class HeroDispatchers {
  constructor(private store: Store<EntityCache>) {}

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

  getFilteredHeroes() {
    this.store.dispatch(new HeroAction.GetFilteredHeroes());
  }
}
