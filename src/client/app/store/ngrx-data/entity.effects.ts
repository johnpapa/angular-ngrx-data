// NOT READY
import { Injectable } from '@angular/core';

import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { concatMap, catchError, first, map, mergeMap, switchMap } from 'rxjs/operators';

import { DataServiceError, EntityCache } from './interfaces';
import { toAction } from './entity.actions';

///////////////// Refactor from here
/*

import * as HeroActions from '../actions';

import { Hero } from '../../model';
import { HeroDataService } from '../services';

const filterAction = new HeroActions.GetFilteredHeroes();

type HeroAction = HeroActions.HeroAction;
@Injectable()
export class HeroEffects {
  @Effect()
  getHeroes$: Observable<Action> = this.actions$
    .ofType(HeroActions.GET_HEROES)
    .pipe(
      switchMap(() =>
        toAction(
          this.heroDataService.getHeroes(),
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
        toAction(
          this.heroDataService.addHero(action.payload),
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
        toAction(
          this.heroDataService.deleteHero(action.payload),
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
        toAction(
          this.heroDataService.updateHero(action.payload),
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
*/
