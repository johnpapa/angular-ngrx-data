// General purpose entity action stuff, good for any entity type

import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { DataServiceError } from '../services';
import { catchError, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

export abstract class DataAction<T> implements Action {
  readonly type: string;
  constructor(public readonly payload: T) {}
}

export abstract class DataErrorAction<T> implements Action {
  readonly type: string;
  constructor(public readonly payload: DataServiceError<T>) {}
}

// Function of additional success actions
// that returns a function that returns
// an observable of ngrx action(s) from DataService method observable
export const toAction = (...actions: Action[]) => <T>(
  source: Observable<T>,
  successAction: new (data: T) => Action,
  errorAction: new (err: DataServiceError<T>) => Action
) =>
  source.pipe(
    mergeMap((data: T) => [new successAction(data), ...actions]),
    catchError((err: DataServiceError<T>) => of(new errorAction(err)))
  );
