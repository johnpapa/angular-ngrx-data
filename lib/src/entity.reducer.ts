import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';
import { IdSelector, Update } from './ngrx-entity-models';

import { EntityAction, EntityOp } from './entity.actions';
import { EntityCache } from './interfaces';
import { EntityCollection, EntityDefinition } from './entity-definition';
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

  constructor(
    private entityDefinitionService: EntityDefinitionService,
    private entityCollectionCreator: EntityCollectionCreator,
    private entityCollectionReducerFactory: EntityCollectionReducerFactory
  ) { }

  /**
   * Create the ngrx-data entity reducer which delegates to
   * an EntityCollectionReducer based on the action.entityName
   */
  create() {
    return (state: EntityCache = {}, action: EntityAction): EntityCache => {
      const entityName = action.entityName;
      if (!entityName) {
        return state; // not an EntityAction
      }

      const collection = state[entityName];
      let def: EntityDefinition;
      let reducer = this.entityCollectionReducers[entityName];

      if (!reducer) {
        def = this.entityDefinitionService.getDefinition(entityName);
        reducer = this.entityCollectionReducerFactory.create(
          entityName, def.entityAdapter, def.selectId);
        this.entityCollectionReducers[entityName] = reducer;
      }

      const newCollection = collection ?
        reducer(collection, action) :
        reducer(this.entityCollectionCreator.create(entityName), action);

      return collection === newCollection ?
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
  registerReducer<T>(entityName: string, reducer: EntityCollectionReducer<T>) {
    this.entityCollectionReducers[entityName.trim()] = reducer;
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
    this.entityCollectionReducers = { ...this.entityCollectionReducers, ...reducers };
  }
}
