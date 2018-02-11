import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { pipe } from 'rxjs/util/pipe';
import { catchError, delay, map, tap, timeout } from 'rxjs/operators';

import { HttpUrlGenerator } from './http-url-generator';
import {
  DataServiceError, EntityCollectionDataService,
  EntityDataServiceConfig,
  HttpMethods, QueryParams, RequestData
 } from './interfaces';

import { Update } from './ngrx-entity-models';

// Pass the observable straight through
export const noDelay = <K>(source: Observable<K>) => source;

/**
 * A basic, generic entity data service
 * suitable for persistence of most entities.
 * Assumes a common REST-y web API
 */
export class DefaultDataService<T> implements EntityCollectionDataService<T> {
  protected _name: string;
  protected entityName: string;
  protected entityUrl: string;
  protected entitiesUrl: string;
  protected getDelay: typeof noDelay;
  protected saveDelay: typeof noDelay;
  protected timeout: typeof noDelay;

  get name() { return this._name; }

  constructor(
    protected http: HttpClient,
    protected httpUrlGenerator: HttpUrlGenerator,
    config: EntityDataServiceConfig,
    entityName: string
  ) {
    this._name = `${entityName} DefaultDataService`;
    this.entityName = entityName;
    config = config || {};
    const { api = '', getDelay = 0, saveDelay = 0, timeout: to = 0 } = config;
    const root = api || 'api';
    this.entityUrl = httpUrlGenerator.entityResource(entityName, root)
    this.entitiesUrl = httpUrlGenerator.collectionResource(entityName, root)
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

  getWithQuery(queryParams: QueryParams | string ): Observable<T[]> {
    const qParams = typeof queryParams === 'string' ? { fromString: queryParams } : { fromObject: queryParams };
    const params = new HttpParams(qParams);
    return this.execute('GET', this.entitiesUrl, undefined, { params });
  }

  update(update: Update<T>): Observable<Update<T>> {
    return this.execute('PUT', this.entityUrl + update.id, update);
  }

  protected execute(
    method: HttpMethods,
    url: string,
    data?: any,
    options?: any): Observable<any> {

    const req: RequestData = { method, url, options };

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
        return this.http.delete(url, options).pipe(tail);
      }
      case 'GET': {
        return this.http.get(url, options).pipe(tail);
      }
      case 'POST': {
        return this.http.post(url, data, options).pipe(tail);
      }
      case 'PUT': {
        const { id, changes } = data; // data must be Update<T>
        return this.http.put(url, changes, options)
          .pipe(
            // return the original Update<T> with merged updated data (if any).
            map(updated => ({id, changes: {...changes, ...updated}})),
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
    return (err: any) => {
      const error = new DataServiceError(err, reqData);
      return new ErrorObservable(error);
    };
  }
}

/**
 * Create a basic, generic entity data service
 * suitable for persistence of most entities.
 * Assumes a common REST-y web API
 */
@Injectable()
export class DefaultDataServiceFactory {
  constructor(
    protected config: EntityDataServiceConfig,
    protected http: HttpClient,
    protected httpUrlGenerator: HttpUrlGenerator
  ) { }

  create<T>(entityName: string) {
    return new DefaultDataService<T>(this.http, this.httpUrlGenerator, this.config, entityName);
  }
}
