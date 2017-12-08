import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { EntityCache, EntityDispatchers } from '../../../ngrx-data';

import { App } from '../../core';

@Injectable()
export class AppDispatchers extends EntityDispatchers<App> {
  constructor(store: Store<EntityCache>) {
    super(App, store);
  }
}
