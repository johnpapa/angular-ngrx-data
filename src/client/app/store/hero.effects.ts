import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { concatMap, catchError, first, map, mergeMap } from 'rxjs/operators';

import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import * as HeroActions from './hero.action';
import { Hero } from '../model';
import { HeroDataService, HeroDataServiceError } from './hero-data.service';
import { State } from './reducers';

const filterAction = new HeroActions.GetFilteredHeroes();

@Injectable()
export class HeroEffects {
  @Effect()
  getHeroes$: Observable<Action> = this.actions$
    .ofType(HeroActions.GET_HEROES).pipe(
      concatMap(() => this.heroDataService.getHeroes()),
      mergeMap(heroes => [new HeroActions.GetHeroesSuccess(heroes), filterAction]),
      catchError(() => of(new HeroActions.GetHeroesError()))
    );

  @Effect()
  addHero$: Observable<Action> = this.actions$
    .ofType<HeroActions.AddHero>(HeroActions.ADD_HERO).pipe(
      concatMap(action => this.heroDataService.addHero(action.payload)),
      mergeMap(hero => [new HeroActions.AddHeroSuccess(hero), filterAction]),
      catchError(() => of(new HeroActions.AddHeroError()))
    );

  @Effect()
  deleteHero$: Observable<Action> = this.actions$
    .ofType<HeroActions.DeleteHero>(HeroActions.DELETE_HERO).pipe(
      concatMap(action => this.heroDataService.deleteHero(action.payload)),
      mergeMap(hero => [new HeroActions.DeleteHeroSuccess(hero), filterAction]),
      catchError((err: HeroDataServiceError<Hero>) =>
        of(new HeroActions.DeleteHeroError(err)))
    );

  @Effect()
  updateHero$: Observable<Action> = this.actions$
    .ofType<HeroActions.UpdateHero>(HeroActions.UPDATE_HERO).pipe(
      concatMap(action => this.heroDataService.updateHero(action.payload)),
      mergeMap(hero => [new HeroActions.UpdateHeroSuccess(hero), filterAction]),
      catchError((err: HeroDataServiceError<Hero>) =>
        of(new HeroActions.UpdateHeroError(err)))
    );

  constructor(
    private store: Store<State>,
    private actions$: Actions,
    private heroDataService: HeroDataService
  ) {}
}
