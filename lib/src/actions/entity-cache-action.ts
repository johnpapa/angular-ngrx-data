/*
 * Actions dedicated to the EntityCache as a whole
 */
import { Action } from '@ngrx/store';

import { EntityCache } from '../reducers/entity-cache';
import { EntityActionOptions } from '../actions/entity-action';
import { MergeStrategy } from '../actions/merge-strategy';

export enum EntityCacheAction {
  CLEAR_COLLECTIONS = 'ngrx-data/entity-cache/clear-collections',
  LOAD_COLLECTIONS = 'ngrx-data/entity-cache/load-collections',
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
 * Clear the collections identified in the collectionSet.
 * @param [collections] Array of names of the collections to clear.
 * If empty array, does nothing. If no array, clear all collections.
 * @param [tag] Optional tag to identify the operation from the app perspective.
 */
export class ClearCollections implements Action {
  readonly payload: { collections: string[]; tag: string };
  readonly type = EntityCacheAction.CLEAR_COLLECTIONS;

  constructor(collections?: string[], tag?: string) {
    this.payload = { collections, tag };
  }
}

/**
 * Create entity cache action that loads multiple entity collections at the same time.
 * before any selectors$ observables emit.
 * @param querySet The collections to load, typically the result of a query.
 * @param [tag] Optional tag to identify the operation from the app perspective.
 * in the form of a map of entity collections.
 */
export class LoadCollections implements Action {
  readonly payload: { collections: EntityCacheQuerySet; tag: string };
  readonly type = EntityCacheAction.LOAD_COLLECTIONS;

  constructor(collections: EntityCacheQuerySet, tag?: string) {
    this.payload = { collections, tag };
  }
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
 * @param [tag] Optional tag to identify the operation from the app perspective.
 */
export class MergeQuerySet implements Action {
  readonly payload: {
    querySet: EntityCacheQuerySet;
    mergeStrategy?: MergeStrategy;
    tag?: string;
  };

  readonly type = EntityCacheAction.MERGE_QUERY_SET;

  constructor(querySet: EntityCacheQuerySet, mergeStrategy?: MergeStrategy, tag?: string) {
    this.payload = {
      querySet,
      mergeStrategy: mergeStrategy === null ? MergeStrategy.PreserveChanges : mergeStrategy,
      tag
    };
  }
}

/**
 * Create entity cache action for replacing the entire entity cache.
 * Dangerous because brute force but useful as when re-hydrating an EntityCache
 * from local browser storage when the application launches.
 * @param cache New state of the entity cache
 * @param [tag] Optional tag to identify the operation from the app perspective.
 */
export class SetEntityCache implements Action {
  readonly payload: { cache: EntityCache; tag: string };
  readonly type = EntityCacheAction.SET_ENTITY_CACHE;

  constructor(public readonly cache: EntityCache, tag?: string) {
    this.payload = { cache, tag };
  }
}
