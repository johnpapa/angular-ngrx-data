import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { Hero } from '../../model';
import * as HeroAction from '../actions';

import { EntityAction, EntityCache } from '../ngrx-data';
import * as EntityActions from '../ngrx-data/entity.actions';

@Injectable()
export class HeroDispatchers {
  constructor(private store: Store<EntityCache>) {}

  deleteHero(hero: Hero) {
    this.store.dispatch(new EntityAction(Hero, EntityActions.DELETE, hero));
  }

  setFilter(filter: string) {
    this.store.dispatch(new EntityAction(Hero, EntityActions.SET_FILTER, filter));
  }

  saveHero(hero: Hero, mode: 'add' | 'update') {
    if (mode === 'add') {
      this.store.dispatch(new EntityAction(Hero, EntityActions.ADD, hero));
    } else {
      this.store.dispatch(new EntityAction(Hero, EntityActions.UPDATE, hero));
    }
  }

  getHeroes() {
    this.store.dispatch(new EntityAction(Hero, EntityActions.GET_ALL));
  }

  getFilteredHeroes() {
    this.store.dispatch(new EntityAction(Hero, EntityActions.GET_FILTERED));
  }
}
