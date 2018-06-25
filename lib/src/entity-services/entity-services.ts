import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { EntityCache } from '../reducers/entity-cache';
import { EntityCollectionService } from './entity-collection-service';
import { EntityCollectionServiceFactory } from './entity-collection-service-factory';

// tslint:disable:member-ordering

/**
 * Class-Interface for a central registry of EntityCollectionServices for all entity types,
 * suitable as an Angular provider token.
 * Creates a new default EntityCollectionService for any entity type not in the registry.
 * Optionally register specialized EntityCollectionServices for individual types
 */
export abstract class EntityServices {
  /** Observable of the entire entity cache */
  abstract readonly entityCache$: Observable<EntityCache> | Store<EntityCache>;

  /** The ngrx store, scoped to the EntityCache */
  abstract readonly store: Store<EntityCache>;

  /** Dispatch any action to the store */
  abstract dispatch(action: Action): void;

  /** Get (or create) the singleton instance of an EntityCollectionService
   * @param entityName {string} Name of the entity type of the service
   */
  abstract getEntityCollectionService<T = any>(entityName: string): EntityCollectionService<T>;

  //// EntityCollectionService creation and registration API //////

  /**
   * Factory to create a default instance of an EntityCollectionService
   * Often called within constructor of a custom collection service
   * @example
   * constructor(private entityServices: EntityServices) {
   *   super('Hero', entityServices.entityCollectionServiceFactory);
   *
   *   // Register self as THE hero service in EntityServices
   *   this.entityServices.registerEntityCollectionService('Hero', this);
   * }
   */
  abstract readonly entityCollectionServiceFactory: EntityCollectionServiceFactory;

  /** Register an EntityCollectionService under its entity type name.
   * Will replace a pre-existing service for that type.
   * @param service {EntityCollectionService} The entity service
   */
  abstract registerEntityCollectionService<T>(service: EntityCollectionService<T>): void;

  /** Register entity services for several entity types at once.
   * Will replace a pre-existing service for that type.
   * @param entityCollectionServices Array of EntityCollectionServices to register
   */
  abstract registerEntityCollectionServices(entityCollectionServices: EntityCollectionService<any>[]): void;

  /** Register entity services for several entity types at once.
   * Will replace a pre-existing service for that type.
   * @param entityCollectionServiceMap Map of service-name to entity-collection-service
   */
  abstract registerEntityCollectionServices(
    // tslint:disable-next-line:unified-signatures
    entityCollectionServiceMap: EntityCollectionServiceMap
  ): void;
}

/**
 * A map of service or entity names to their corresponding EntityCollectionServices.
 */
export interface EntityCollectionServiceMap {
  [entityName: string]: EntityCollectionService<any>;
}
