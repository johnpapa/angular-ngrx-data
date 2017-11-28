import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { delay } from 'rxjs/operators/delay';

// import 'rxjs/Rx';

import { Hero } from '../model';

const api = '/api';
const fakeDelay = 1000;

@Injectable()
export class HeroDataService {
  constructor(private http: HttpClient) {}

  logout() {
    return this.http.get(`${api}/logout`);
  }

  getProfile() {
    return this.http.get<any>(`${api}/profile`);
  }

  getHeroes(criteria: string): Observable<Hero[]> {
    console.log(`searching for ${criteria}`);
    return this.http
      .get<Array<Hero>>(`${api}/heroes`)
      .pipe(delay(fakeDelay))
      .catch(this.handleError);
  }

  private handleError(res: HttpErrorResponse) {
    console.error(res.error);
    return Observable.throw(res.error || 'Server error');
  }

  deleteHero(hero: Hero) {
    return this.http.delete(`${api}/hero/${hero.id}`).pipe(delay(fakeDelay));
  }

  addHero(hero: Hero) {
    return this.http.post<Hero>(`${api}/hero/`, hero).pipe(delay(fakeDelay));
  }

  updateHero(hero: Hero) {
    return this.http.put<Hero>(`${api}/hero/${hero.id}`, hero).pipe(delay(fakeDelay));
  }
}
