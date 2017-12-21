import { Action } from '@ngrx/store';

export const TOGGLE_DATASOURCE = 'TOGGLE_DATASOURCE [SESSION] ';

export class ToggleDataSource implements Action {
  readonly type = TOGGLE_DATASOURCE;
  constructor(public readonly payload: string) {}
}

export type All = ToggleDataSource;
