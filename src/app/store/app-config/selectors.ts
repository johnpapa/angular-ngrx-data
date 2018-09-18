import { Injectable } from '@angular/core';
import { Store, createFeatureSelector, createSelector } from '@ngrx/store';

import { App } from '../../core';
import { AppState } from './reducer';
import { distinctUntilChanged, tap } from 'rxjs/operators';

import { initialState } from './reducer';

const getAppState = createFeatureSelector<AppState>('appConfig');

// The following selector implementation guards against empty session state
// as happens when replay with redux dev tools
const getDataSource = createSelector(getAppState, (state: AppState) => (state ? state.session.dataSource : initialState.dataSource));

@Injectable()
export class AppSelectors {
  constructor(private store: Store<AppState>) {}

  get dataSource$() {
    return this.store.select(getDataSource).pipe(distinctUntilChanged());
  }
}
