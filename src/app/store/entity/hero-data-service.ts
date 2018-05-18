// Example: creating a custom DataService.
// see EntityStoreModule for providing and registering
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  EntityCollectionDataService,
  DefaultDataService,
  HttpUrlGenerator,
  Logger,
  QueryParams
} from 'ngrx-data';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Hero } from '../../core';

@Injectable()
export class HeroDataService extends DefaultDataService<Hero> {
  constructor(
    http: HttpClient,
    httpUrlGenerator: HttpUrlGenerator,
    logger: Logger
  ) {
    super('Hero', http, httpUrlGenerator);
    logger.log('Created custom Hero EntityDataService');
  }

  getAll(): Observable<Hero[]> {
    return super
      .getAll()
      .pipe(map(heroes => heroes.map(hero => this.mapHero(hero))));
  }

  getById(id: string | number): Observable<Hero> {
    return super.getById(id).pipe(map(hero => this.mapHero(hero)));
  }

  getWithQuery(params: string | QueryParams): Observable<Hero[]> {
    return super
      .getWithQuery(params)
      .pipe(map(heroes => heroes.map(hero => this.mapHero(hero))));
  }

  /** Add dateLoaded if not already set */
  private mapHero(hero: Hero): Hero {
    return hero.dateLoaded ? hero : { ...hero, dateLoaded: new Date() };
  }
}
