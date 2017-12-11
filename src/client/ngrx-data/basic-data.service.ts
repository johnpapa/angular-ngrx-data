import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, delay, map } from 'rxjs/operators';

import { DataServiceError, EntityCollectionDataService } from './interfaces';

export interface BasicDataServiceOptions {
  api?: string;
  entityName: string;
  entitiesName?: string;
  getDelay?: number;
  saveDelay?: number;
}

// Pass the observable straight through
const noDelay = <K>(source: Observable<K>) => source;

/**
 * A basic, generic entity data service
 * suitable for persistence of most entities.
 * Assumes a common REST-y web API
 * Conforms to API required by ngrx-data library's persist$ API
 */
export class BasicDataService<T extends { id: any }> implements EntityCollectionDataService<T> {
  protected entityUrl: string;
  protected entitiesUrl: string;
  protected getDelay: typeof noDelay;
  protected saveDelay: typeof noDelay;

  constructor(
    protected http: HttpClient,
    { api, entitiesName, entityName, getDelay = 0, saveDelay = 0 }: BasicDataServiceOptions
  ) {
    // All URLs presumed to be lowercase
    this.entityUrl = `${api}/${entityName}/`.toLowerCase();
    this.entitiesUrl = `${api}/${entitiesName}/`.toLowerCase();
    this.getDelay = getDelay ? delay(getDelay) : noDelay;
    this.saveDelay = saveDelay ? delay(saveDelay) : noDelay;
  }

  add(entity: T): Observable<T> {
    return this.http
      .post<T>(this.entityUrl, entity)
      .pipe(this.saveDelay, catchError(this.handleError(entity)));
  }

  delete(id: any): Observable<T> {
    return this.http
      .delete(this.entityUrl + id)
      .pipe(this.saveDelay, catchError(this.handleError(id)));
  }

  getAll(filter?: string): Observable<T[]> {
    return this.http
      .get<Array<T>>(this.entitiesUrl)
      .pipe(this.getDelay, catchError(this.handleError()));
  }

  getById(id: any): Observable<T> {
    return this.http
      .get<T>(this.entityUrl + id)
      .pipe(this.getDelay, catchError(this.handleError()));
  }

  update(entity: T): Observable<T> {
    return this.http.put<T>(this.entityUrl + entity.id, entity).pipe(
      this.saveDelay,
      map(() => entity), // return the updated entity
      catchError(this.handleError(entity))
    );
  }

  private handleError(requestData?: any) {
    return (res: any) => {
      console.error(res);
      const err = res.error || res.message || (res.body && res.body.error) || res;
      const error = new DataServiceError(err, requestData);
      return new ErrorObservable(error);
    };
  }
}
