import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { EntityCache, EntitySelectors } from '../../../ngrx-data';

import { Villain } from '../../core';

@Injectable()
export class VillainSelectors extends EntitySelectors<Villain> {
  constructor(store: Store<EntityCache>) {
    super(Villain, store);
  }

  filteredVillains$() {
    return this.filteredEntities$();
  }

  villains$() {
    return this.entities$();
  }
}
