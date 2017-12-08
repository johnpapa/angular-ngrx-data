import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { EntityCache, EntitySelectors } from '../../../ngrx-data';

import { App } from '../../core';

@Injectable()
export class AppSelectors extends EntitySelectors<App> {
  constructor(store: Store<EntityCache>) {
    super(App, store);
  }
}
