import { Injectable } from '@angular/core';
import { Store, createFeatureSelector, createSelector } from '@ngrx/store';

import { App } from '../../core';
import { AppState } from './reducer';
import { distinctUntilChanged, tap } from 'rxjs/operators';

import { initialState } from './reducer';

const getAppState = createFeatureSelector<AppState>('appConfig');
const getDataSource = createSelector(getAppState, (state: AppState) =>
  // state.session.dataSource); // fails when replay with redux dev tools
  // recover if no state as during replay in redux dev tools
  state ? state.session.dataSource : initialState.dataSource );

@Injectable()
export class AppSelectors {
  constructor(private store: Store<AppState>) {}

  dataSource$() {
    return this.store.select(getDataSource).pipe(distinctUntilChanged());
  }
}
