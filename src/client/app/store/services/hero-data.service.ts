import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, delay, map } from 'rxjs/operators';

import { DataServiceError, EntityCollectionDataService } from '../../../ngrx-data';

import { Hero } from '../../core';

const api = '/api';
const fakeDelays = { select: 1000, save: 200 };

@Injectable()
export class HeroDataService implements EntityCollectionDataService<Hero> {
  constructor(private http: HttpClient) {}

  add(hero: Hero): Observable<Hero> {
    return this.http
      .post<Hero>(`${api}/hero/`, hero)
      .pipe(delay(fakeDelays.save), catchError(this.handleError(hero)));
  }

  delete(hero: Hero): Observable<Hero> {
    return this.http.delete(`${api}/hero/${hero.id}`).pipe(
      delay(fakeDelays.save),
      map(() => hero), // return the deleted hero
      catchError(this.handleError(hero))
    );
  }

  getAll(filter?: string): Observable<Hero[]> {
    return this.http
      .get<Array<Hero>>(`${api}/heroes`)
      .pipe(delay(fakeDelays.select), catchError(this.handleError()));
  }

  getById(id: any): Observable<Hero> {
    throw new Error('Method not implemented.');
  }

  update(hero: Hero): Observable<Hero> {
    return this.http.put<Hero>(`${api}/hero/${hero.id}`, hero).pipe(
      delay(fakeDelays.save),
      map(() => hero), // return the updated hero
      catchError(this.handleError(hero))
    );
  }

  private handleError<T>(requestData?: T) {
    return (res: HttpErrorResponse) => {
      const error = new DataServiceError(res.error, requestData);
      console.error(error);
      return new ErrorObservable(error);
    };
  }
}
