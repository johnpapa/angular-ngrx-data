import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { EntityCache, EntitySelectors } from '../../../ngrx-data';

import { Hero } from '../../core';

@Injectable()
export class HeroSelectors extends EntitySelectors<Hero> {
  constructor(store: Store<EntityCache>) {
    super(Hero, store);
  }

  filteredHeroes$() {
    return this.filteredEntities$();
  }

  heroes$() {
    return this.entities$();
  }
}
