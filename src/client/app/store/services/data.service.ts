// General purpose DataService stuff, good for any entity type
export const api = '/api';
export const fakeDelays = { select: 1000, save: 200 };

export class DataServiceError<T> {
  constructor(public error: any, public requestData: T) {}
}
