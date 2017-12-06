import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, delay, map } from 'rxjs/operators';

import { api, DataServiceError, fakeDelays } from './data.service';

import { Hero } from '../../model';

@Injectable()
export class HeroDataService {
  constructor(private http: HttpClient) {}

  addHero(hero: Hero): Observable<Hero> {
    return this.http
      .post<Hero>(`${api}/hero/`, hero)
      .pipe(
        delay(fakeDelays.save),
        catchError(this.handleError(hero))
      );
  }

  deleteHero(hero: Hero): Observable<Hero> {
    return this.http
      .delete(`${api}/hero/${hero.id}`)
      .pipe(
        delay(fakeDelays.save),
        map(() => hero), // return the deleted hero
        catchError(this.handleError(hero))
      );
  }

  getHeroes(filter?: string): Observable<Hero[]> {
    return this.http
      .get<Array<Hero>>(`${api}/heroes`)
      .pipe(
        delay(fakeDelays.select),
        catchError(this.handleError())
      );
  }

  updateHero(hero: Hero): Observable<Hero> {
    return this.http
      .put<Hero>(`${api}/hero/${hero.id}`, hero)
      .pipe(
        delay(fakeDelays.save),
        map(() => hero), // return the updated hero
        catchError(this.handleError(hero))
      );  }

  private handleError<T>(requestData?: T) {
    return (res: HttpErrorResponse) => {
      const error = new DataServiceError(res.error, requestData);
      console.error(error);
      return new ErrorObservable(error);
    };
  }
}
