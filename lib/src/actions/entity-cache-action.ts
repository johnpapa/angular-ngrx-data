/*
 * Actions dedicated to the EntityCache as a whole
 */
import { Action } from '@ngrx/store';

import { EntityCache } from '../reducers/entity-cache';
import { EntityActionOptions } from '../actions/entity-action';

export enum EntityCacheAction {
  MERGE_QUERY_SET = 'ngrx-data/entity-cache/merge-query-set',
  SET_ENTITY_CACHE = 'ngrx-data/entity-cache/set-cache'
}

export interface EntityCacheQuerySet {
  [entityName: string]: any[];
}

/**
 * Create entity cache action that merges entities from a query result
 * that returned entities from multiple collections.
 * Corresponding entity cache reducer should add and update all collections
 * at the same time, before any selectors$ observables emit.
 */
export class MergeQuerySet implements Action {
  readonly type = EntityCacheAction.MERGE_QUERY_SET;
  constructor(public readonly payload: EntityCacheQuerySet, options?: EntityActionOptions) {}
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
