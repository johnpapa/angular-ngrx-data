import { EntityAction } from '../actions/entity-action';
import { RequestData } from './interfaces';

export class DataServiceError {
  readonly message: string;
  constructor(public error: any, public requestData: RequestData) {
    // TODO:  Log properly, not to console
    console.error(error, requestData);
    this.message =
      (error.error && error.error.message) ||
      (error.message ||
      (error.body && error.body.error) ||
       error).toString();
  }
}

/** Payload for an EntityAction data service error such as QUERY_ALL_ERROR */
export interface EntityActionDataServiceError {
  originalAction: EntityAction;
  error: DataServiceError;
}
