import { EntityAction } from '../actions/entity-action';
import { RequestData } from './interfaces';

/**
 * Error from a DataService
 * The source error either comes from a failed HTTP response or was thrown within the service.
 * @param error the HttpResponse error or the error thrown by the service
 * @param requestData the HTTP request information such as the method and the url.
 */
// If extend from Error, `dse instanceof DataServiceError` returns false
// in some (all?) unit tests so don't bother trying.
export class DataServiceError {
  message: string;

  constructor(public error: any, public requestData: RequestData) {
    this.message = (error.error && error.error.message) || (error.message || (error.body && error.body.error) || error).toString();
  }
}

/** Payload for an EntityAction data service error such as QUERY_ALL_ERROR */
export interface EntityActionDataServiceError {
  error: DataServiceError;
  originalAction: EntityAction;
}
