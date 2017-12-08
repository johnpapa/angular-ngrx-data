import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { EntityCache, EntityDispatchers } from '../../../ngrx-data';

import { Villain } from '../../core';

@Injectable()
export class VillainDispatchers extends EntityDispatchers<Villain> {
  constructor(store: Store<EntityCache>) {
    super(Villain, store);
  }
}
