import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, delay, map } from 'rxjs/operators';

import { DataServiceError, EntityCollectionDataService } from '../ngrx-data';

import { Villain } from '../../core';

const api = '/api';
const fakeDelays = { select: 1000, save: 200 };

@Injectable()
export class VillainDataService implements EntityCollectionDataService<Villain> {
  constructor(private http: HttpClient) {}

  add(villain: Villain): Observable<Villain> {
    return this.http
      .post<Villain>(`${api}/villain/`, villain)
      .pipe(delay(fakeDelays.save), catchError(this.handleError(villain)));
  }

  delete(villain: Villain): Observable<Villain> {
    return this.http.delete(`${api}/villain/${villain.id}`).pipe(
      delay(fakeDelays.save),
      map(() => villain), // return the deleted villain
      catchError(this.handleError(villain))
    );
  }

  getAll(filter?: string): Observable<Villain[]> {
    return this.http
      .get<Array<Villain>>(`${api}/villains`)
      .pipe(delay(fakeDelays.select), catchError(this.handleError()));
  }

  getById(id: any): Observable<Villain> {
    throw new Error('Method not implemented.');
  }

  update(villain: Villain): Observable<Villain> {
    return this.http.put<Villain>(`${api}/villain/${villain.id}`, villain).pipe(
      delay(fakeDelays.save),
      map(() => villain), // return the updated villain
      catchError(this.handleError(villain))
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
