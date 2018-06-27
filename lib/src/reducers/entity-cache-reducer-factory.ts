import { Injectable } from '@angular/core';
import { Action, ActionReducer } from '@ngrx/store';

import { EntityAction } from '../actions/entity-action';
import { EntityCache } from './entity-cache';
import { EntityCacheAction, MergeQuerySet } from '../actions/entity-cache-action';
import { EntityCollection } from './entity-collection';
import { EntityCollectionCreator } from './entity-collection-creator';
import { EntityCollectionReducerRegistry } from './entity-collection-reducer-registry';
import { EntityOp } from '../actions/entity-op';
import { Logger } from '../utils/interfaces';
import { MergeStrategy } from '../actions/merge-strategy';

@Injectable()
export class EntityCacheReducerFactory {
  constructor(
    private entityCollectionCreator: EntityCollectionCreator,
    private entityCollectionReducerRegistry: EntityCollectionReducerRegistry,
    private logger: Logger
  ) {}

  /**
   * Create the ngrx-data entity cache reducer which either responds to entity cache level actions
   * or (more commonly) delegates to an EntityCollectionReducer based on the action.payload.entityName.
   */
  create(): ActionReducer<EntityCache, Action> {
    // This technique ensures a named function appears in the debugger
    return entityCacheReducer.bind(this);

    function entityCacheReducer(
      this: EntityCacheReducerFactory,
      entityCache: EntityCache = {},
      action: { type: string; payload?: any }
    ): EntityCache {
      // EntityCache actions
      switch (action.type) {
        case EntityCacheAction.SET_ENTITY_CACHE: {
          // Completely replace the EntityCache. Be careful!
          return action.payload;
        }

        // Merge entities from each collection in the QuerySet
        // using collection reducer's upsert operation
        case EntityCacheAction.MERGE_QUERY_SET: {
          return this.mergeQuerySetReducer(entityCache, action as MergeQuerySet);
        }
      }

      // Apply collection reducer if this is a valid EntityAction for a collection
      const payload = action.payload;
      if (payload && payload.entityName && payload.entityOp && !payload.error) {
        return this.applyCollectionReducer(entityCache, action as EntityAction);
      }

      // Not a valid EntityAction
      return entityCache;
    }
  }

  /** Apply reducer for the action's EntityCollection (if the action targets a collection) */
  private applyCollectionReducer(cache: EntityCache = {}, action: EntityAction) {
    const entityName = action.payload.entityName;
    const collection = cache[entityName];
    const reducer = this.entityCollectionReducerRegistry.getOrCreateReducer(entityName);

    let newCollection: EntityCollection;
    try {
      newCollection = collection ? reducer(collection, action) : reducer(this.entityCollectionCreator.create(entityName), action);
    } catch (error) {
      this.logger.error(error);
      action.payload.error = error;
    }

    return action.payload.error || collection === newCollection ? cache : { ...cache, [entityName]: newCollection };
  }

  /**
   * Reducer to merge query sets in the form of a hash of entity data for multiple collections.
   * @param entityCache the entity cache
   * @param action a MergeQuerySet action with the query set and a MergeStrategy
   */
  protected mergeQuerySetReducer(entityCache: EntityCache, action: MergeQuerySet) {
    // tslint:disable-next-line:prefer-const
    let { mergeStrategy, querySet } = action.payload;
    mergeStrategy = mergeStrategy === null ? MergeStrategy.PreserveChanges : mergeStrategy;
    const entityOp = EntityOp.UPSERT_MANY;

    const entityNames = Object.keys(querySet);
    entityCache = entityNames.reduce((newCache, entityName) => {
      const payload = {
        entityName,
        entityOp,
        data: querySet[entityName],
        mergeStrategy
      };
      const act: EntityAction = { type: `[${entityName}] ${action.type}`, payload };
      newCache = this.applyCollectionReducer(newCache, act);
      return newCache;
    }, entityCache);
    return entityCache;
  }
}
