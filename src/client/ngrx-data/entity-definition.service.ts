import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';

import { Store, createFeatureSelector, Selector } from '@ngrx/store';

import { EntityMetadata, EntityMetadataMap } from './entity-metadata';
import { createEntityDefinition, EntityDefinition, EntityDefinitions } from './entity-definition';
import { EntityCache, EntityClass, getEntityName } from './interfaces';
import { createEntityReducer, EntityCollectionReducers } from './entity.reducer';
import {
  createEntitySelectors$Factory,
  EntitySelectors,
  EntitySelectors$
} from './entity.selectors';

export const ENTITY_METADATA = new InjectionToken<EntityMetadataMap>('ENTITY_METADATA');

@Injectable()
export class EntityDefinitionService {
  /** {EntityDefinitions} for all cached entity types */
  readonly definitions: EntityDefinitions = {};

  constructor(
    @Optional()
    @Inject(ENTITY_METADATA)
    entityMetadataMaps: EntityMetadataMap[]
  ) {
    if (entityMetadataMaps) {
      entityMetadataMaps.forEach(map => this.registerMetadataMap(map));
    }
  }

  /** Get the reducer for these EntityCache collection definitions */
  getEntityReducer() {
    return createEntityReducer(this);
  }

  /**
   * Get (or create) a data service for entity type
   * @param entityClass - the name of the type or the class itself
   *
   * Examples:
   *   getDefinition('Hero'); // definition for Heroes, untyped
   *   getDefinition(Hero);   // definition for Heroes, typed with Hero class
   *   getDefinition<Hero>(`Hero`); // definition for Heroes, typed with Hero interface
   */
  getDefinition<T>(entityClass: string | EntityClass<T>, shouldThrow = true): EntityDefinition<T> {
    const entityName = getEntityName(entityClass);
    const definition = this.definitions[entityName];
    if (!definition && shouldThrow) {
      throw new Error(`No EntityDefinition for entity type "${entityName}".`);
    }
    return definition;
  }

  getAllEntityReducers() {
    const definitions = this.definitions;
    const reducers: EntityCollectionReducers = {};
    Object.keys(definitions).forEach(name => (reducers[name] = definitions[name].reducer));
    return reducers;
  }

  getAllEntitySelectors() {
    const definitions = this.definitions;
    const selectors: { [name: string]: EntitySelectors<any> } = {};
    Object.keys(definitions).forEach(name => (selectors[name] = definitions[name].selectors));
    return selectors;
  }

  getAllEntitySelectors$(store: Store<EntityCache>, cacheName = 'entityCache') {
    const definitions = this.definitions;
    const selectors$: { [name: string]: EntitySelectors$<any> } = {};
    const cacheSelector = createFeatureSelector<EntityCache>(cacheName);
    Object.keys(definitions).forEach(
      name => (selectors$[name] = definitions[name].selectors$Factory(store, cacheSelector))
    );
    return selectors$;
  }

  getAllInitialStates() {
    const definitions = this.definitions;
    const initialStates: { [entityName: string]: any } = {};
    Object.keys(definitions).forEach(
      name => (initialStates[name] = definitions[name].initialState)
    );
    return initialStates;
  }

  //////// Registration methods //////////

  /**
   * Create and register the {EntityDefinition} for the {EntityMetadata} of an entity type
   * @param name - the name of the entity type
   * @param definition - {EntityMetadata} for a collection for that entity type
   *
   * Examples:
   *   registerMetadata('Hero', myHeroEntityDefinition); // untyped
   *   registerMetadata(Hero, myHeroEntityDefinition); // typed, Hero is a class
   *   registerMetadata<Hero>('Hero', myHeroEntityDefinition); // typed, Hero is an interface
   */
  registerMetadata<T>(entityType: EntityClass<T> | string, metadata: EntityMetadata<T>) {
    if (metadata) {
      const definition = createEntityDefinition(entityType, metadata);
      this.registerDefinition(definition);
    }
  }

  /**
   * Register an EntityMetadataMap.
   * @param metadataMap - a map of entityType names to entity metadata
   *
   * Examples:
   *   registerMetadataMap({
   *     'Hero': myHeroMetadata,
   *     Villain: myVillainMetadata
   *   });
   */
  registerMetadataMap(metadataMap: EntityMetadataMap = {}) {
    Object.keys(metadataMap).forEach(name => this.registerMetadata(name, metadataMap[name]));
  }

  /**
   * Register an {EntityDefinition} for an entity type
   * @param definition - EntityDefinition of a collection for that entity type
   *
   * Examples:
   *   registerDefinition('Hero', myHeroEntityDefinition);
   */
  registerDefinition<T>(definition: EntityDefinition<T>) {
    this.definitions[definition.entityName] = definition;
  }

  /**
   * Register a batch of EntityDefinitions.
   * @param definitions - map of entityType name and associated EntityDefinitions to merge.
   *
   * Examples:
   *   registerDefinitions({
   *     'Hero': myHeroEntityDefinition,
   *     Villain: myVillainEntityDefinition
   *   });
   */
  registerDefinitions(definitions: EntityDefinitions) {
    Object.assign(this.definitions, definitions);
  }
}
