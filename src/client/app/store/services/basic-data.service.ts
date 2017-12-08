import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, delay, map } from 'rxjs/operators';

import { DataServiceError, EntityCollectionDataService } from '../../../ngrx-data';

export interface BasicDataServiceOptions {
  api?: string;
  entityName: string;
  entitiesName?: string;
  getDelay?: number;
  saveDelay?: number;
}

/**
 * A basic, generic entity data service
 * suitable for persistence of most entities.
 * Assumes a common REST-y web API
 * Conforms to API required by ngrx-data library's persist$ API
 */
export class BasicDataService<T extends { id: any }> implements EntityCollectionDataService<T> {
  protected entityUrl: string;
  protected entitiesUrl: string;
  protected saveDelay: number;
  protected getDelay: number;

  constructor(
    protected http: HttpClient,
    { api = '/api', entitiesName, entityName, getDelay = 0, saveDelay = 0 }: BasicDataServiceOptions
  ) {
    this.entityUrl = `${api}/${entityName}/`;
    this.entitiesUrl = `${api}/${entitiesName}/`;
    this.getDelay = getDelay;
    this.saveDelay = saveDelay;
  }

  add(entity: T): Observable<T> {
    return this.http
      .post<T>(this.entityUrl, entity)
      .pipe(delay(this.saveDelay), catchError(this.handleError(entity)));
  }

  delete(entity: T): Observable<T> {
    return this.http.delete(this.entityUrl + entity.id).pipe(
      delay(this.saveDelay),
      map(() => entity), // return the deleted entity
      catchError(this.handleError(entity))
    );
  }

  getAll(filter?: string): Observable<T[]> {
    return this.http
      .get<Array<T>>(this.entitiesUrl)
      .pipe(delay(this.getDelay), catchError(this.handleError()));
  }

  getById(id: any): Observable<T> {
    return this.http
      .get<T>(this.entityUrl + id)
      .pipe(delay(this.getDelay), catchError(this.handleError()));
  }

  update(entity: T): Observable<T> {
    return this.http.put<T>(this.entityUrl + entity.id, entity).pipe(
      delay(this.saveDelay),
      map(() => entity), // return the updated entity
      catchError(this.handleError(entity))
    );
  }

  private handleError(requestData?: any) {
    return (res: HttpErrorResponse) => {
      const error = new DataServiceError(res.error, requestData);
      console.error(error);
      return new ErrorObservable(error);
    };
  }
}
