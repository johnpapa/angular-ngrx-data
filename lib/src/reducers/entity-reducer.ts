import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';

import { Action, ActionReducer, compose, MetaReducer } from '@ngrx/store';

import { EntityAdapter } from '@ngrx/entity';
import { IdSelector, Update } from '../utils';

import { EntityAction } from '../actions/entity-action';
import { EntityOp } from '../actions/entity-op';
import { EntityCache } from './entity-cache';
import { MERGE_ENTITY_CACHE, SET_ENTITY_CACHE } from '../actions/entity-cache-actions';
import { EntityCollection } from './entity-collection';
import { EntityCollectionCreator } from './entity-collection-creator';
import { ENTITY_COLLECTION_META_REDUCERS } from './constants';
import { EntityCollectionReducer, EntityCollectionReducerFactory } from './entity-collection.reducer';
import { EntityDefinition } from '../entity-metadata/entity-definition';
import { EntityDefinitionService } from '../entity-metadata/entity-definition.service';

export interface EntityCollectionReducers {
  [entity: string]: EntityCollectionReducer<any>;
}

@Injectable()
export class EntityReducerFactory {

  /** Registry of entity types and their previously-constructed reducers */
  protected entityCollectionReducers: EntityCollectionReducers = {};

  private entityCollectionMetaReducer: MetaReducer<EntityCollection, EntityAction>;

  constructor(
    private entityDefinitionService: EntityDefinitionService,
    private entityCollectionCreator: EntityCollectionCreator,
    private entityCollectionReducerFactory: EntityCollectionReducerFactory,
    @Optional() @Inject(ENTITY_COLLECTION_META_REDUCERS)
      entityCollectionMetaReducers?: MetaReducer<EntityCollection, EntityAction>[]
  ) {
    this.entityCollectionMetaReducer =
      compose.apply(null, entityCollectionMetaReducers || []);
  }

  /**
   * Create the ngrx-data entity reducer which either responds to entity cache level actions
   * or (more commonly) delegates to an EntityCollectionReducer based on the action.entityName.
   */
  create(): ActionReducer<EntityCache, EntityAction> {
    return (state: EntityCache = {}, action: EntityAction): EntityCache => {
      switch (action.type) {
        case SET_ENTITY_CACHE: {
          // Completely replace the EntityCache. Be careful!
          return action.payload;
        }
        case MERGE_ENTITY_CACHE: {
          // Replace collections in the current cache with collections in the payload.
          // Beware: unsaved changes in the replaced collections are lost
          return { ...state, ...action.payload };
        }
      }

      return this.applyCollectionReducer(state, action);
    };
  }

  /** Apply reducer for the action's EntityCollection (if the action targets a collection) */
  private applyCollectionReducer(state: EntityCache = {}, action: EntityAction) {
    const entityName = action.entityName;
    if (!entityName || action.error) {
      return state; // not an EntityAction or an errant one
    }
    const collection = state[entityName];
    const reducer = this.getOrCreateReducer(entityName)

    let newCollection: EntityCollection;
    try {
      newCollection = collection ?
        reducer(collection, action) :
        reducer(this.entityCollectionCreator.create(entityName), action);
    } catch (error) {
      // TODO:  Log properly, not to console
      console.error(error);
      action.error = error;
    }

    return action.error || collection === newCollection ?
      state :
      { ...state, [entityName]: newCollection };
  }

  /**
   * Get the registered EntityCollectionReducer<T> for this entity type or create one and register it.
   * @param entityName Name of the entity type for this reducer
   */
  getOrCreateReducer<T>(entityName: string): EntityCollectionReducer<T> {
    let def: EntityDefinition;
    let reducer: EntityCollectionReducer<T> = this.entityCollectionReducers[entityName];

    if (!reducer) {
      def = this.entityDefinitionService.getDefinition(entityName);
      reducer = this.entityCollectionReducerFactory.create(
        entityName, def.entityAdapter, def.selectId);
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
    return this.entityCollectionReducers[entityName.trim()] = reducer;
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

export function createEntityReducer(entityReducerFactory: EntityReducerFactory) {
  return entityReducerFactory.create();
}
