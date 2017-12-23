import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { pipe } from 'rxjs/util/pipe';
import { catchError, delay, map, tap, timeout } from 'rxjs/operators';

import { DataServiceError, EntityCollectionDataService, RequestData } from './interfaces';
import { Update } from './ngrx-entity-models';

export interface BasicDataServiceOptions {
  api?: string;
  entityName: string;
  entitiesName?: string;
  getDelay?: number;
  saveDelay?: number;
  timeout?: number;
}

// Pass the observable straight through
const noDelay = <K>(source: Observable<K>) => source;

/**
 * A basic, generic entity data service
 * suitable for persistence of most entities.
 * Assumes a common REST-y web API
 * Conforms to API required by ngrx-data library's persist$ API
 */
export class BasicDataService<T> implements EntityCollectionDataService<T> {
  protected entityUrl: string;
  protected entitiesUrl: string;
  protected getDelay: typeof noDelay;
  protected saveDelay: typeof noDelay;
  protected timeout: typeof noDelay;

  constructor(
    protected http: HttpClient,
    {
      api,
      entitiesName,
      entityName,
      getDelay = 0,
      saveDelay = 0,
      timeout: to = 0
    }: BasicDataServiceOptions
  ) {
    // All URLs presumed to be lowercase
    this.entityUrl = `${api}/${entityName}/`.toLowerCase();
    this.entitiesUrl = `${api}/${entitiesName}/`.toLowerCase();
    this.getDelay = getDelay ? delay(getDelay) : noDelay;
    this.saveDelay = saveDelay ? delay(saveDelay) : noDelay;
    this.timeout = to ? timeout(to) : noDelay;
  }

  add(entity: T): Observable<T> {
    return this.execute('POST', this.entityUrl, entity);
  }

  delete(id: any): Observable<null> {
    return this.execute('DELETE', this.entityUrl + id);
  }

  getAll(): Observable<T[]> {
    return this.execute('GET', this.entitiesUrl);
  }

  getById(id: any): Observable<T> {
    return this.execute('GET', this.entityUrl + id);
  }

  update(update: Update<T>): Observable<Update<T>> {
    return this.execute('PUT', this.entityUrl + update.id, update);
  }

  protected execute(
    method: 'DELETE' | 'GET' | 'POST' | 'PUT',
    url: string,
    data?: any
  ): Observable<any> {
    const req: RequestData = { method, url, data };

    const tail = pipe(
      method === 'GET' ? this.getDelay : this.saveDelay,
      this.timeout,
      catchError(this.handleError(req))
      // tap(value => {
      //   console.log(value)
      // })
    );

    switch (method) {
      case 'DELETE': {
        return this.http.delete(url).pipe(tail);
      }
      case 'GET': {
        return this.http.get(url).pipe(tail);
      }
      case 'POST': {
        return this.http.post(url, data).pipe(tail);
      }
      case 'PUT': {
        const { id, changes } = data; // data must be Update<T>
        return this.http.put(url, changes).pipe(
          // return the original Update<T> with merged updated data (if any).
          map(updated => ({ id, changes: { ...changes, updated } })),
          tail
        );
      }
      default: {
        const error = new Error('Unimplemented HTTP method, ' + method);
        return new ErrorObservable(error);
      }
    }
  }

  private handleError(reqData: RequestData) {
    return (res: any) => {
      console.error(res, reqData);
      const err = res.error || res.message || (res.body && res.body.error) || res;
      const error = new DataServiceError(err, reqData);
      return new ErrorObservable(error);
    };
  }
}
