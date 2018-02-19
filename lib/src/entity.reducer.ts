import { Inject, Injectable, Optional } from '@angular/core';

import { Action, ActionReducer, compose, MetaReducer } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';
import { IdSelector, Update } from './ngrx-entity-models';

import { EntityAction, EntityOp } from './entity.actions';
import { EntityCache,  EntityCollection, ENTITY_COLLECTION_META_REDUCERS } from './interfaces';
import { EntityDefinition } from './entity-definition';
import { EntityCollectionCreator } from './entity-collection-creator';
import { EntityCollectionReducer, EntityCollectionReducerFactory } from './entity-collection.reducer';
import { EntityDefinitionService } from './entity-definition.service';

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
   * Create the ngrx-data entity reducer which delegates to
   * an EntityCollectionReducer based on the action.entityName
   */
  create(): ActionReducer<EntityCache, EntityAction> {
    return (state: EntityCache = {}, action: EntityAction): EntityCache => {
      const entityName = action.entityName;
      if (!entityName || action.error) {
        return state; // not a valid EntityAction
      }

      const collection = state[entityName];
      let def: EntityDefinition;
      let reducer = this.entityCollectionReducers[entityName];

      if (!reducer) {
        def = this.entityDefinitionService.getDefinition(entityName);
        reducer = this.entityCollectionReducerFactory.create(
          entityName, def.entityAdapter, def.selectId);
        reducer = this.registerReducer(entityName, reducer);
        this.entityCollectionReducers[entityName] = reducer;
      }

      let newCollection: EntityCollection;
      try {
        newCollection = collection ?
          reducer(collection, action) :
          reducer(this.entityCollectionCreator.create(entityName), action);
      } catch (error) {
        // TODO:  Log properly, not to console
        console.error(action.error);
        action.error = error;
      }

      return action.error || collection === newCollection ?
        state :
        { ...state, ...{ [entityName]: newCollection } };
    };
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
