import { Action } from '@ngrx/store';

export const TOGGLE_DATASOURCE = '[Session] TOGGLE_DATASOURCE';

export class ToggleDataSource implements Action {
  readonly type = TOGGLE_DATASOURCE;
  constructor(public readonly payload: string) {}
}

export type All = ToggleDataSource;
