import { EntityAction } from '../actions/entity-action';
import { RequestData } from './interfaces';

export class DataServiceError extends Error {
  constructor(public originalError: any, public requestData: RequestData) {
    super(
      (originalError.error && originalError.error.message) ||
        (originalError.message || (originalError.body && originalError.body.error) || originalError).toString()
    );
  }
}

/** Payload for an EntityAction data service error such as QUERY_ALL_ERROR */
export interface EntityActionDataServiceError {
  error: DataServiceError;
  originalAction: EntityAction;
}
