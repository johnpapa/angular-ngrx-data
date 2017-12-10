import { Action, Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';

import { EntityOp } from './entity.actions';
export { EntityOp } from './entity.actions';

export class DataServiceError<T> {
  constructor(public error: any, public requestData: T) {}
}

export class EntityAction<T extends Object, P> implements Action {
  readonly type: string;
  readonly entityName: string;

  constructor(
    classOrAction: EntityClass<T> | string | EntityAction<T, any>,
    public readonly op: EntityOp,
    public readonly payload?: P
  ) {
    this.entityName = classOrAction instanceof EntityAction ?
      classOrAction.entityName : getEntityName(classOrAction);
    this.type = `${this.op} [${this.entityName}]`.toUpperCase();
  }
}

export abstract class EntityCollectionDataService<T> {
  abstract getAll(options?: any): Observable<T[]>;
  abstract getById(id: any): Observable<T>;
  abstract add(entity: T): Observable<T>;
  abstract delete(id: any): Observable<T>;
  abstract update(entity: T): Observable<T>;
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
}

/**
 * Get name of the entity type (e.g. "Hero")
 * @param entityClass - the name of the entity class or the class itself
 */
export function getEntityName<T>(entityClass: string | EntityClass<T>) {
  return typeof entityClass === 'string' ? entityClass : entityClass.name;
}
