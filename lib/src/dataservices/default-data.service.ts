import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { of } from 'rxjs/observable/of';
import { pipe } from 'rxjs/util/pipe';
import { catchError, map, tap, timeout } from 'rxjs/operators';

import { DataServiceError } from './data-service-error';
import { HttpMethods, QueryParams, RequestData } from './interfaces';
import { HttpUrlGenerator, EntityHttpResourceUrls } from './http-url-generator';
import { makeResponseDelay } from './make-response-delay';

import { EntityCollectionDataService } from './entity-data.service';
import { Update } from '../utils';

// Pass the observable straight through
export const noDelay = <K>(source: Observable<K>) => source;

/**
 * Optional configuration settings for an entity collection data service
 * such as the `DefaultDataService<T>`.
 */
export abstract class DefaultDataServiceConfig {
  /** root path of the web api (default: 'api') */
  root?: string;
  /**
   * Known entity HttpResourceUrls.
   * HttpUrlGenerator will create these URLs for entity types not listed here.
   */
  entityHttpResourceUrls?: EntityHttpResourceUrls;
  /** Is a DELETE 404 really OK? (default: true) */
  delete404OK?: boolean;
  /** Simulate GET latency in a demo (default: 0) */
  getDelay?: number;
  /** Simulate save method (PUT/POST/DELETE) latency in a demo (default: 0) */
  saveDelay?: number;
  /** request timeout in MS (default: 0)*/
  timeout?: number; //
}

/**
 * A basic, generic entity data service
 * suitable for persistence of most entities.
 * Assumes a common REST-y web API
 */
export class DefaultDataService<T> implements EntityCollectionDataService<T> {
  protected _name: string;
  protected delete404OK: boolean;
  protected entityName: string;
  protected entityUrl: string;
  protected entitiesUrl: string;
  protected getDelay: typeof noDelay;
  protected saveDelay: typeof noDelay;
  protected timeout: typeof noDelay;

  get name() { return this._name; }

  constructor(
    entityName: string,
    protected http: HttpClient,
    protected httpUrlGenerator: HttpUrlGenerator,
    config?: DefaultDataServiceConfig,
  ) {
    this._name = `${entityName} DefaultDataService`;
    this.entityName = entityName;
    const {
      root = 'api',
      delete404OK = true,
      getDelay = 0,
      saveDelay = 0,
      timeout: to = 0,
    } = (config || {});
    this.delete404OK = delete404OK;
    this.entityUrl = httpUrlGenerator.entityResource(entityName, root);
    this.entitiesUrl = httpUrlGenerator.collectionResource(entityName, root);
    this.getDelay = getDelay ? makeResponseDelay(getDelay) : noDelay;
    this.saveDelay = saveDelay ? makeResponseDelay(saveDelay) : noDelay;
    this.timeout = to ? timeout(to) : noDelay;
  }

  add(entity: T): Observable<T> {
    const entityOrError = entity || new Error(`No "${this.entityName}" entity to add`);
    return this.execute('POST', this.entityUrl, entityOrError);
  }

  delete(key: number | string ): Observable<null> {
    let err: Error;
    if (key == null) {
      err = new Error(`No "${this.entityName}" key to delete`);
    }
    return this.execute('DELETE', this.entityUrl + key, err);
  }

  getAll(): Observable<T[]> {
    return this.execute('GET', this.entitiesUrl);
  }

  getById(key: number | string): Observable<T> {
    let err: Error;
    if (key == null) {
      err = new Error(`No "${this.entityName}" key to get`);
    }
    return this.execute('GET', this.entityUrl + key, err);
  }

  getWithQuery(queryParams: QueryParams | string ): Observable<T[]> {
    const qParams = typeof queryParams === 'string' ? { fromString: queryParams } : { fromObject: queryParams };
    const params = new HttpParams(qParams);
    return this.execute('GET', this.entitiesUrl, undefined, { params });
  }

  update(update: Update<T>): Observable<Update<T>> {
    const id = update && update.id;
    const updateOrError = id == null ?
      new Error(`No "${this.entityName}" update data or id`) :
      update;
    return this.execute('PUT', this.entityUrl + id, updateOrError );
  }

  protected execute(
    method: HttpMethods,
    url: string,
    data?: any, // data, error, or undefined/null
    options?: any): Observable<any> {

    const req: RequestData = { method, url, options };

    if (data instanceof Error) {
      return this.handleError(req)(data);
    }

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
      // N.B.: It must return an Update<T>
      case 'PUT': {
        const { id, changes } = data; // data must be Update<T>
        return this.http.put(url, changes, options)
          .pipe(
            map(updated => {
              // Return Update<T> with merged updated data (if any).
              // If no data from server,
              const noData = Object.keys(updated || {}).length === 0;
              // assume the server made no additional changes of its own and
              // append `unchanged: true` to the original payload.
              return noData ?
                { ...data, unchanged: true } :
                { id, changes: { ...changes, ...updated } };
            }),
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
      const ok = this.handleDelete404(err, reqData);
      if (ok) { return ok; }
      const error = new DataServiceError(err, reqData);
      return new ErrorObservable(error);
    };
  }

  private handleDelete404(error: HttpErrorResponse, reqData: RequestData) {
    if (error.status === 404 && reqData.method === 'DELETE' && this.delete404OK) {
      return of({});
    }
    return undefined;
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
    protected http: HttpClient,
    protected httpUrlGenerator: HttpUrlGenerator,
    @Optional() protected config?: DefaultDataServiceConfig,
  ) {
    config = config || {};
    httpUrlGenerator.registerHttpResourceUrls(config.entityHttpResourceUrls);
  }

  /**
   * Create a default {EntityCollectionDataService} for the given entity type
   * @param entityName {string} Name of the entity type for this data service
   */
  create<T>(entityName: string): EntityCollectionDataService<T> {
    return new DefaultDataService<T>(entityName, this.http, this.httpUrlGenerator, this.config);
  }
}
