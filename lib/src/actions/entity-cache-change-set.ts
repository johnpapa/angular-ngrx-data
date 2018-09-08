import { Action } from '@ngrx/store';
import { EntityActionOptions } from './entity-action';
import { EntityCacheAction } from './entity-cache-action';
import { Update } from '../utils/ngrx-entity-models';
import { DataServiceError } from '../dataservices/data-service-error';

export enum ChangeSetOperation {
  Add = 'Add',
  Delete = 'Delete',
  Update = 'Update',
  Upsert = 'Upsert'
}
export interface ChangeSetAdd<T = any> {
  op: ChangeSetOperation.Add;
  entityName: string;
  entities: T[];
}

export interface ChangeSetDelete {
  op: ChangeSetOperation.Delete;
  entityName: string;
  entities: string[] | number[];
}

export interface ChangeSetUpdate<T = any> {
  op: ChangeSetOperation.Update;
  entityName: string;
  entities: Update<T>[];
}

export interface ChangeSetUpsert<T = any> {
  op: ChangeSetOperation.Upsert;
  entityName: string;
  entities: T[];
}

/**
 * A entities of a single entity type, which are changed in the same way by a ChangeSetOperation
 */
export type ChangeSetItem = ChangeSetAdd | ChangeSetDelete | ChangeSetUpdate | ChangeSetUpsert;

/*
 * A set of entity Changes, typically to be saved.
 */
export interface ChangeSet<T = any> {
  /** An array of ChangeSetItems to be processed in the array order */
  changes: ChangeSetItem[];

  /**
   * An arbitrary, serializable object that should travel with the ChangeSet.
   * Meaningful to the ChangeSet producer and consumer. Ignored by ngrx-data.
   */
  extras?: T;

  /** An arbitrary string, identifying the ChangeSet and perhaps its purpose */
  tag?: string;
}
