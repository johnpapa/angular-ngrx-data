import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import * as HeroActions from './hero.action';
import { Hero } from './hero';
import { HeroService } from './hero.service';

@Injectable()
export class HeroEffects {
  @Effect()
  getHeroes$: Observable<Action> = this.actions$
    .ofType(HeroActions.GET_HEROES)
    .map((action: HeroActions.GetHeroes) => action.payload)
    .switchMap(filterCriteria => this.heroService.getHeroes())
    .map(results => new HeroActions.GetHeroesSuccess(results))
    .catch(() => of(new HeroActions.GetHeroError()));

  @Effect()
  createHero$: Observable<Action> = this.actions$
    .ofType(HeroActions.ADD_HERO)
    .map((action: HeroActions.AddHero) => action.payload)
    .switchMap(hero => this.heroService.addHero(hero))
    .map((hero: Hero) => new HeroActions.AddHeroSuccess(hero))
    .catch((hero: Hero) => of(new HeroActions.AddHeroError()));

  @Effect()
  deleteHero$: Observable<Action> = this.actions$
    .ofType(HeroActions.DELETE_HERO)
    .map((action: HeroActions.DeleteHero) => action.payload)
    .switchMap(hero => this.heroService.deleteHero(hero))
    .map((hero: Hero) => new HeroActions.DeleteHeroSuccess(hero))
    .catch((hero: Hero) => of(new HeroActions.DeleteHeroError(hero)));

  @Effect()
  updateHero$: Observable<Action> = this.actions$
    .ofType(HeroActions.UPDATE_HERO)
    .map((action: HeroActions.UpdateHero) => action.payload)
    .switchMap(hero => this.heroService.updateHero(hero))
    .map((hero: Hero) => new HeroActions.UpdateHeroSuccess(hero))
    .catch((hero: Hero) => of(new HeroActions.UpdateHeroError(hero)));

  constructor(private actions$: Actions, private heroService: HeroService) {}
}
