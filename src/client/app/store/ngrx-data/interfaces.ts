export class DataServiceError<T> {
  constructor(public error: any, public requestData: T) {}
}

export type EntityClass<T extends Object> = new (...x: any[]) => T;

export interface EntityCache {
  // Must be any since we don't know what type of collections we will have
  [name: string]: EntityCollection<any>;
}

export class EntityCollection<T> {
  filter = '';
  entities: T[] = [];
  filteredEntities: T[] = [];
  loading = false;
  error = false;
}
