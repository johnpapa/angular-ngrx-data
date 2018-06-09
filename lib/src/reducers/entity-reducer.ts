import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';

import { Action, ActionReducer, compose, MetaReducer } from '@ngrx/store';

import { EntityAction } from '../actions/entity-action';
import { EntityCache } from './entity-cache';
import { EntityCacheAction, EntityCacheQuerySet } from '../actions/entity-cache-action';
import { EntityCollection } from './entity-collection';
import { EntityCollectionCreator } from './entity-collection-creator';
import { ENTITY_COLLECTION_META_REDUCERS } from './constants';
import { EntityCollectionReducer, EntityCollectionReducerFactory } from './entity-collection-reducer';
import { EntityOp } from '../actions/entity-op';
import { Logger } from '../utils/interfaces';

export interface EntityCollectionReducers {
  [entity: string]: EntityCollectionReducer<any>;
}

@Injectable()
export class EntityReducerFactory {
  /** Registry of entity types and their previously-constructed reducers */
  protected entityCollectionReducers: EntityCollectionReducers = {};

  private entityCollectionMetaReducer: MetaReducer<EntityCollection, EntityAction>;

  constructor(
    private entityCollectionCreator: EntityCollectionCreator,
    private entityCollectionReducerFactory: EntityCollectionReducerFactory,
    private logger: Logger,
    @Optional()
    @Inject(ENTITY_COLLECTION_META_REDUCERS)
    entityCollectionMetaReducers?: MetaReducer<EntityCollection, EntityAction>[]
  ) {
    this.entityCollectionMetaReducer = compose.apply(null, entityCollectionMetaReducers || []);
  }

  /**
   * Create the ngrx-data entity cache reducer which either responds to entity cache level actions
   * or (more commonly) delegates to an EntityCollectionReducer based on the action.payload.entityName.
   */
  create(): ActionReducer<EntityCache, Action> {
    // This technique ensures a named function appears in the debugger
    return entityCacheReducer.bind(this);

    function entityCacheReducer(this: EntityReducerFactory, cache: EntityCache = {}, action: { type: string; payload?: any }): EntityCache {
      // EntityCache actions
      switch (action.type) {
        case EntityCacheAction.SET_ENTITY_CACHE: {
          // Completely replace the EntityCache. Be careful!
          return action.payload;
        }

        // Merge entities from each collection in the QuerySet
        // using collection reducer's upsert operation
        case EntityCacheAction.MERGE_QUERY_SET: {
          const op = EntityOp.UPSERT_MANY;
          const mergePayload = action.payload; // for the options
          const querySet = mergePayload.data as EntityCacheQuerySet;
          const entityNames = Object.keys(querySet);
          cache = entityNames.reduce((newCache, entityName) => {
            const payload = {
              ...mergePayload,
              entityName,
              op,
              data: querySet[entityName]
            };
            const act: EntityAction = { type: action.type, payload };
            newCache = this.applyCollectionReducer(newCache, act);
            return newCache;
          }, cache);
          return cache;
        }
      }

      // EntityCollection actions
      return this.applyCollectionReducer(cache, action as EntityAction);
    }
  }

  /** Apply reducer for the action's EntityCollection (if the action targets a collection) */
  private applyCollectionReducer(cache: EntityCache = {}, action: EntityAction) {
    const entityName = action.payload.entityName;
    if (!entityName || action.payload.error) {
      return cache; // not an EntityAction or an errant one
    }
    const collection = cache[entityName];
    const reducer = this.getOrCreateReducer(entityName);

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
   * Get the registered EntityCollectionReducer<T> for this entity type or create one and register it.
   * @param entityName Name of the entity type for this reducer
   */
  getOrCreateReducer<T>(entityName: string): EntityCollectionReducer<T> {
    let reducer: EntityCollectionReducer<T> = this.entityCollectionReducers[entityName];

    if (!reducer) {
      reducer = this.entityCollectionReducerFactory.create<T>(entityName);
      reducer = this.registerReducer<T>(entityName, reducer);
      this.entityCollectionReducers[entityName] = reducer;
    }
    return reducer;
  }

  /**
   * Register an EntityCollectionReducer for an entity type
   * @param entityName - the name of the entity type
   * @param reducer - reducer for that entity type
   *
   * Examples:
   *   registerReducer('Hero', myHeroReducer);
   *   registerReducer('Villain', myVillainReducer);
   */
  registerReducer<T>(entityName: string, reducer: EntityCollectionReducer<T>): ActionReducer<EntityCollection<T>, EntityAction<T>> {
    reducer = this.entityCollectionMetaReducer(reducer);
    return (this.entityCollectionReducers[entityName.trim()] = reducer);
  }

  /**
   * Register a batch of EntityCollectionReducers.
   * @param reducers - reducers to merge into existing reducers
   *
   * Examples:
   *   registerReducers({
   *     Hero: myHeroReducer,
   *     Villain: myVillainReducer
   *   });
   */
  registerReducers(reducers: EntityCollectionReducers) {
    const keys = reducers ? Object.keys(reducers) : [];
    keys.forEach(key => this.registerReducer(key, reducers[key]));
  }
}

export function createEntityReducer(entityReducerFactory: EntityReducerFactory): ActionReducer<EntityCache, EntityAction> {
  return entityReducerFactory.create();
}
