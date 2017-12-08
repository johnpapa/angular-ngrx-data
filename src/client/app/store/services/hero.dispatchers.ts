import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { EntityCache, EntityDispatchers } from '../../../ngrx-data';

import { Hero } from '../../core';

@Injectable()
export class HeroDispatchers extends EntityDispatchers<Hero> {
  constructor(store: Store<EntityCache>) {
    super(Hero, store);
  }
}
