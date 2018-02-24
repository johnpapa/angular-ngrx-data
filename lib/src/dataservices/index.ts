export * from './data-service-error';
export * from './default-data.service';
export * from './entity-data.service';
export * from './http-url-generator';
export * from './persistence-result-handler.service';

export type HttpMethods = 'DELETE' | 'GET' | 'POST' | 'PUT';

export interface RequestData {
  method: HttpMethods;
  url: string;
  options: any;
}

/**
 * A key/value map of parameters to be turned into an HTTP query string
 * Same as HttpClient's HttpParamsOptions which is NOT exported at package level
 * https://github.com/angular/angular/issues/22013
 */
export interface QueryParams { [name: string]: string | string[]; }
