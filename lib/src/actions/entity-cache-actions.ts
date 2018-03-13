/*
 * Actions dedicated to the EntityCache as a whole
 */
import { Action } from '@ngrx/store';

import { EntityCache } from '../reducers/entity-cache';

export const MERGE_ENTITY_CACHE = 'ngrx-data/entity-cache/merge';
export const SET_ENTITY_CACHE = 'ngrx-data/entity-cache/set';

/**
 * Create cache merge operation that replaces the collections in cache with the
 * collections in the payload.
 * Dangerous but useful as when re-hydrating an EntityCache from local browser storage
 * or rolling selected collections back to a previously known state.
 */
export class EntityCacheMerge implements Action {
  readonly type = MERGE_ENTITY_CACHE;
  constructor(public readonly payload: EntityCache) {}
}

/**
 * Create cache set operation that replaces the entire entity cache.
 * Dangerous but useful as when re-hydrating an EntityCache from local browser storage
 * when the application launches.
 */
export class EntityCacheSet implements Action {
  readonly type = SET_ENTITY_CACHE;
  constructor(public readonly payload: EntityCache) {}
}
