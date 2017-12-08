import { Injectable } from '@angular/core';
import { Store, createFeatureSelector, createSelector } from '@ngrx/store';

import { App } from '../../core';
import { AppState } from './reducer';

const getAppState = createFeatureSelector<AppState>('appCache');
const getDataSource = createSelector(getAppState, (state: AppState) => state.session.dataSource);

@Injectable()
export class AppSelectors {
  constructor(private store: Store<AppState>) {}

  dataSource$() {
    return this.store.select(getDataSource);
  }
}
