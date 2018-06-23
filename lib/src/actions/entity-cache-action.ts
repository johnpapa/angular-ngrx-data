/*
 * Actions dedicated to the EntityCache as a whole
 */
import { Action } from '@ngrx/store';

import { EntityCache } from '../reducers/entity-cache';
import { EntityActionOptions } from '../actions/entity-action';
import { MergeStrategy } from '../actions/merge-strategy';

export enum EntityCacheAction {
  MERGE_QUERY_SET = 'ngrx-data/entity-cache/merge-query-set',
  SET_ENTITY_CACHE = 'ngrx-data/entity-cache/set-cache'
}

/**
 * Hash of entities keyed by EntityCollection name,
 * typically the result of a query that returned results from a multi-collection query
 * that will be merged into an EntityCache via the `MergeQuerySet` action.
 */
export interface EntityCacheQuerySet {
  [entityName: string]: any[];
}

/**
 * Create entity cache action that merges entities from a query result
 * that returned entities from multiple collections.
 * Corresponding entity cache reducer should add and update all collections
 * at the same time, before any selectors$ observables emit.
 * @param querySet The result of the query in the form of a map of entity collections.
 * These are the entity data to merge into the respective collections.
 * @param mergeStrategy How to merge a queried entity when it is already in the collection.
 * The default is MergeStrategy.PreserveChanges
 */
export class MergeQuerySet implements Action {
  readonly payload: {
    querySet: EntityCacheQuerySet;
    mergeStrategy?: MergeStrategy;
  };

  readonly type = EntityCacheAction.MERGE_QUERY_SET;

  constructor(querySet: EntityCacheQuerySet, mergeStrategy?: MergeStrategy) {
    this.payload = {
      querySet,
      mergeStrategy: mergeStrategy === null ? MergeStrategy.PreserveChanges : mergeStrategy
    };
  }
}

/**
 * Create entity cache action for replacing the entire entity cache.
 * Dangerous because brute force but useful as when re-hydrating an EntityCache
 * from local browser storage when the application launches.
 */
export class SetEntityCache implements Action {
  readonly type = EntityCacheAction.SET_ENTITY_CACHE;
  constructor(public readonly payload: EntityCache) {}
}
