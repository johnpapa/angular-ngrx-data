import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Hero } from './hero';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
// import 'rxjs/Rx';

const api = '/api';

@Injectable()
export class HeroService {
  constructor(private http: HttpClient) {}

  logout() {
    return this.http.get(`${api}/logout`);
  }

  getProfile() {
    return this.http.get<any>(`${api}/profile`);
  }

  getHeroes() {
    return this.http
      .get<Array<Hero>>(`${api}/heroes`)
      .map(heroes => heroes)
      .catch(this.handleError);
  }

  private handleError(res: HttpErrorResponse) {
    console.error(res.error);
    return Observable.throw(res.error || 'Server error');
  }

  deleteHero(hero: Hero) {
    return this.http.delete(`${api}/hero/${hero.id}`);
  }

  addHero(hero: Hero) {
    return this.http.post<Hero>(`${api}/hero/`, hero);
  }

  updateHero(hero: Hero) {
    return this.http.put<Hero>(`${api}/hero/${hero.id}`, hero);
  }
}
