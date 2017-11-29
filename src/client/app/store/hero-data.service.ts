import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError, delay, map } from 'rxjs/operators';

// import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/map';
// import 'rxjs/Rx';

import { Hero } from '../model';

const api = '/api';
const fakeDelays = { select: 1000, save: 200 };

@Injectable()
export class HeroDataService {
  constructor(private http: HttpClient) {}

  addHero(hero: Hero) {
    return this.http
      .post<Hero>(`${api}/hero/`, hero)
      .pipe(delay(fakeDelays.save))
      .catch(this.handleError);
  }

  deleteHero(hero: Hero) {
    return this.http
      .delete(`${api}/hero/${hero.id}`)
      .pipe(delay(fakeDelays.save), catchError(this.handleError));
  }

  getHeroes(filter?: string): Observable<Hero[]> {
    return this.http
      .get<Array<Hero>>(`${api}/heroes`)
      .pipe(delay(fakeDelays.select), catchError(this.handleError));
  }

  updateHero(hero: Hero) {
    return this.http
      .put<Hero>(`${api}/hero/${hero.id}`, hero)
      .pipe(delay(fakeDelays.save), catchError(this.handleError));
  }

  private handleError(res: HttpErrorResponse) {
    console.error(res.error);
    return Observable.throw(res.error || 'Server error');
  }
}
