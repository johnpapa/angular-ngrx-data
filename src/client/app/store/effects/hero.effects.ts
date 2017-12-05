import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';

import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import * as heroActions from '../actions';
import { Hero } from '../../model';
import { HeroDataService, HeroDataServiceError } from '../services';
import { HeroicState } from '../reducers';

@Injectable()
export class HeroEffects {
  @Effect()
  getHeroes$: Observable<Action> = this.actions$
    .ofType(heroActions.GET_HEROES)
    .pipe(
      switchMap(() => this.heroDataService.getHeroes()),
      mergeMap(heroes => [
        new heroActions.GetHeroesSuccess(heroes),
        new heroActions.GetFilteredHeroes()
      ]),
      catchError(error => of(new heroActions.GetHeroesError(error)))
    );

  @Effect()
  addHero$: Observable<Action> = this.actions$
    .ofType<heroActions.AddHero>(heroActions.ADD_HERO)
    .pipe(
      switchMap(action => this.heroDataService.addHero(action.payload)),
      mergeMap(hero => [new heroActions.AddHeroSuccess(hero), new heroActions.GetFilteredHeroes()]),
      catchError(error => of(new heroActions.AddHeroError(error)))
    );

  @Effect()
  deleteHero$: Observable<Action> = this.actions$
    .ofType<heroActions.DeleteHero>(heroActions.DELETE_HERO)
    .pipe(
      switchMap(action => this.heroDataService.deleteHero(action.payload)),
      mergeMap(hero => [
        new heroActions.DeleteHeroSuccess(hero),
        new heroActions.GetFilteredHeroes()
      ]),
      catchError((err: HeroDataServiceError<Hero>) => of(new heroActions.DeleteHeroError(err)))
    );

  @Effect()
  updateHero$: Observable<Action> = this.actions$
    .ofType<heroActions.UpdateHero>(heroActions.UPDATE_HERO)
    .pipe(
      switchMap(action => this.heroDataService.updateHero(action.payload)),
      mergeMap(hero => [
        new heroActions.UpdateHeroSuccess(hero),
        new heroActions.GetFilteredHeroes()
      ]),
      catchError((err: HeroDataServiceError<Hero>) => of(new heroActions.UpdateHeroError(err)))
    );

  constructor(
    private store: Store<HeroicState>,
    private actions$: Actions,
    private heroDataService: HeroDataService
  ) {}
}
