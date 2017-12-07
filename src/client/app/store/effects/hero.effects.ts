import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { concatMap, catchError, first, map, mergeMap, switchMap } from 'rxjs/operators';

import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { DataServiceError, EntityAction, EntityCache } from '../ngrx-data';
import * as HeroActions from '../actions';

import { Hero } from '../../core';
import { HeroDataService } from '../services';

const filterAction = new HeroActions.GetFilteredHeroes();
const toHeroAction = toActionOld(filterAction);

type HeroAction = HeroActions.HeroAction;

// Function of additional success actions
// that returns a function that returns
// an observable of ngrx action(s) from DataService method observable
export function toActionOld<T>(...actions: Action[]) {
  return (
    source: Observable<T>,
    successAction: new (data: T) => Action,
    errorAction: new (err: DataServiceError<T>) => Action
  ) =>
    source.pipe(
      mergeMap((data: T) => [new successAction(data), ...actions]),
      catchError((err: DataServiceError<T>) => of(new errorAction(err)))
    );
}

@Injectable()
export class HeroEffects {
  @Effect()
  getHeroes$: Observable<Action> = this.actions$
    .ofType(HeroActions.GET_HEROES)
    .pipe(
      switchMap(() =>
        toHeroAction(
          this.heroDataService.getAll(),
          HeroActions.GetHeroesSuccess,
          HeroActions.GetHeroesError
        )
      )
    );

  @Effect()
  addHero$: Observable<Action> = this.actions$
    .ofType(HeroActions.ADD_HERO)
    .pipe(
      concatMap((action: HeroAction) =>
        toHeroAction(
          this.heroDataService.add(action.payload),
          HeroActions.AddHeroSuccess,
          HeroActions.AddHeroError
        )
      )
    );

  @Effect()
  deleteHero$: Observable<Action> = this.actions$
    .ofType(HeroActions.DELETE_HERO)
    .pipe(
      concatMap((action: HeroAction) =>
        toHeroAction(
          this.heroDataService.delete(action.payload),
          HeroActions.DeleteHeroSuccess,
          HeroActions.DeleteHeroError
        )
      )
    );

  @Effect()
  updateHero$: Observable<Action> = this.actions$
    .ofType<HeroActions.UpdateHero>(HeroActions.UPDATE_HERO)
    .pipe(
      concatMap((action: HeroAction) =>
        toHeroAction(
          this.heroDataService.update(action.payload),
          HeroActions.UpdateHeroSuccess,
          HeroActions.UpdateHeroError
        )
      )
    );

  constructor(
    private store: Store<EntityCache>,
    private actions$: Actions,
    private heroDataService: HeroDataService
  ) {}
}
