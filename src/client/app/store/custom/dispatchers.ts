import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { App } from '../../core';
import * as AppActions from './actions';
import { AppState } from './reducer';

@Injectable()
export class AppDispatchers {
  constructor(private store: Store<AppState>) {}

  toggleDataSource(location: string) {
    this.store.dispatch(new AppActions.ToggleDataSource(location));
  }
}
