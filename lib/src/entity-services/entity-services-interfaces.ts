import { Action, Store } from '@ngrx/store';

import { Observable } from 'rxjs';

import { EntityAction } from '../actions/entity-action';
import { EntityOp } from '../actions/entity-op';
import { EntityCache } from '../reducers/entity-cache';
import { EntityCommands } from '../dispatchers/entity-commands';
import { EntityDispatcher } from '../dispatchers/entity-dispatcher';
import { EntitySelectors$ } from '../selectors/entity-selectors$';
import { EntitySelectors } from '../selectors/entity-selectors';

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
 * A facade for managing
 * a cached collection of T entities in the ngrx store.
 */
export interface EntityCollectionService<T> extends EntityCommands<T>, EntitySelectors$<T> {
  /** Create an EntityAction for this collection */
  createEntityAction(op: EntityOp, payload?: any): EntityAction<T>;

  /**
   * Dispatch an action to the ngrx store.
   * @param action the Action
   */
  dispatch(action: Action): void;

  /** Dispatcher of EntityCommands (EntityActions) */
  readonly dispatcher: EntityDispatcher<T>;

  /** Name of the entity for this collection service */
  readonly entityName: string;

  /** All selector functions of the entity collection */
  readonly selectors: EntitySelectors<T>;

  /** All selectors$ (observables of the selectors of entity collection properties) */
  readonly selectors$: EntitySelectors$<T>;

  /** The Ngrx Store for the EntityCache */
  readonly store: Store<EntityCache>;
}

/** The sub-service members of an EntityCollectionService */
export interface EntityCollectionServiceElements<T, S$ extends EntitySelectors$<T> = EntitySelectors$<T>> {
  readonly dispatcher: EntityDispatcher<T>;
  readonly selectors: EntitySelectors<T>;
  readonly selectors$: S$;
}

export abstract class EntityCollectionServiceFactory {
  /**
   * Create an EntityCollectionService for an entity type
   * @param entityName - name of the entity type
   */
  abstract create<T, S$ extends EntitySelectors$<T> = EntitySelectors$<T>>(entityName: string): EntityCollectionService<T>;

  /** Observable of the entire entity cache */
  readonly entityCache$: Observable<EntityCache> | Store<EntityCache>;

  /**
   * Get the core sub-service elements.
   * A helper method for EntityCollectionServiceFactory implementors.
   */
  abstract getEntityCollectionServiceElements<T, S$ extends EntitySelectors$<T> = EntitySelectors$<T>>(
    entityName: string
  ): EntityCollectionServiceElements<T, S$>;
}

/**
 * A map of service or entity names to their corresponding EntityCollectionServices.
 */
export interface EntityCollectionServiceMap {
  [entityName: string]: EntityCollectionService<any>;
}
