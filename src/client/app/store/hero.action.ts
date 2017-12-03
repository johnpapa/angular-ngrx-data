import { Action } from '@ngrx/store';

import { Hero } from '../model';
import { HeroDataServiceError } from './hero-data.service';

export const ADD_HERO = '[Hero] ADD_HERO';
export const ADD_HERO_SUCCESS = '[Hero] ADD_HERO_SUCCESS';
export const ADD_HERO_ERROR = '[Hero] ADD_HERO_ERROR';

export const GET_HERO = '[Hero] GET_HERO';
export const GET_HERO_SUCCESS = '[Hero] GET_HERO_SUCCESS';
export const GET_HERO_ERROR = '[Hero] GET_HERO_ERROR';

export const UPDATE_HERO = '[Hero] UPDATE_HERO';
export const UPDATE_HERO_SUCCESS = '[Hero] UPDATE_HERO_SUCCESS';
export const UPDATE_HERO_ERROR = '[Hero] UPDATE_HERO_ERROR';

export const SET_FILTER = '[Hero] - SET_FILTER';
export const SET_FILTERED_HEROES = '[Hero] SET_FILTERED_HEROES';

export const GET_HEROES = '[Hero] GET_HEROES';
export const GET_HEROES_SUCCESS = '[Hero] GET_HEROES_SUCCESS';
export const GET_HEROES_ERROR = '[Hero] GET_HEROES_ERROR';

export const DELETE_HERO = '[Hero] DELETE_HERO';
export const DELETE_HERO_SUCCESS = '[Hero] DELETE_HERO_SUCCESS';
export const DELETE_HERO_ERROR = '[Hero] DELETE_HERO_ERROR';

export class SetFilter implements Action {
  readonly type = SET_FILTER;
  constructor(public payload: string) {}
}

export class GetFilteredHeroes implements Action {
  readonly type = SET_FILTERED_HEROES;
  constructor(public payload: string = '') {}
}

export class GetHeroes implements Action {
  readonly type = GET_HEROES;
}

export class GetHeroesSuccess implements Action {
  readonly type = GET_HEROES_SUCCESS;
  constructor(public payload: Hero[]) {}
}

export class GetHeroesError implements Action {
  readonly type = GET_HEROES_ERROR;
}

export class AddHero implements Action {
  readonly type = ADD_HERO;
  constructor(public payload: Hero) {}
}

export class AddHeroSuccess implements Action {
  readonly type = ADD_HERO_SUCCESS;
  constructor(public payload: Hero) {}
}

export class AddHeroError implements Action {
  readonly type = ADD_HERO_ERROR;
}

export class GetHero implements Action {
  readonly type = GET_HERO;
  constructor(payload: string) {}
}

export class GetHeroSuccess implements Action {
  readonly type = GET_HERO_SUCCESS;
  constructor(public payload: Hero) {}
}

export class GetHeroError implements Action {
  readonly type = GET_HERO_ERROR;
}

export class UpdateHero implements Action {
  readonly type = UPDATE_HERO;
  constructor(public payload: Hero) {}
}

export class UpdateHeroSuccess implements Action {
  readonly type = UPDATE_HERO_SUCCESS;
  constructor(public payload: Hero) {}
}

export class UpdateHeroError implements Action {
  readonly type = UPDATE_HERO_ERROR;
  constructor(public payload: HeroDataServiceError<Hero>) {}
}

export class DeleteHero implements Action {
  readonly type = DELETE_HERO;
  constructor(public payload: Hero) {}
}

export class DeleteHeroSuccess implements Action {
  readonly type = DELETE_HERO_SUCCESS;
  constructor(public payload: Hero) {}
}

export class DeleteHeroError implements Action {
  readonly type = DELETE_HERO_ERROR;
  constructor(public payload: HeroDataServiceError<Hero>) {}
}

export type All =
  | GetHero
  | GetHeroSuccess
  | GetHeroError
  | UpdateHero
  | UpdateHeroSuccess
  | UpdateHeroError
  | GetHeroes
  | SetFilter
  | GetFilteredHeroes
  | GetHeroesSuccess
  | GetHeroesError
  | AddHero
  | AddHeroSuccess
  | AddHeroError
  | DeleteHero
  | DeleteHeroSuccess
  | DeleteHeroError;
