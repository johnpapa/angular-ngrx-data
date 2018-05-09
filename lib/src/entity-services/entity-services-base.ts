import { Inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';

import { Observable } from 'rxjs';

import { EntityCache } from '../reducers/entity-cache';
import {
  EntityCollectionService,
  EntityCollectionServiceFactory,
  EntityCollectionServiceMap,
  EntityServices
} from './entity-services-interfaces';
import { EntityCollectionServiceBase } from './entity-collection-service-base';
import { EntitySelectorsFactory } from '../selectors/entity-selectors';

/**
 * Base/default class of a central registry of EntityCollectionServices for all entity types.
 * Creates a new default EntityCollectionService for any entity type not in the registry.
 * Optionally register specialized EntityCollectionServices for individual types
 *
 * Create your own subclass to add app-specific members for an improved developer experience.
 *
 * @example
 * export class EntityServices extends EntityServicesBase {
 *   constructor(
 *     store: Store<EntityCache>,
 *     entityCollectionServiceFactory: EntityCollectionServiceFactory) {
 *     super(store, entityCollectionServiceFactory);
 *   }
 *   // Extend with well-known, app entity collection services
 *   // Convenience property to return a typed custom entity collection service
 *   get companyService() {
 *     return this.getService<Model.Company>('Company') as CompanyService;
 *   }
 *   // Convenience dispatch methods
 *   clearCompany(companyId: string) {
 *     this.dispatch(new ClearCompanyAction(companyId));
 *   }
 * }
 */
@Injectable()
export class EntityServicesBase implements EntityServices {
  /** Observable of the entire entity cache */
  readonly entityCache$: Observable<EntityCache> | Store<EntityCache>;

  private readonly EntityCollectionServices: {
    [entityName: string]: EntityCollectionService<any>;
  } = {};

  // Dear ngrx-data developer: think hard before changing the constructor
  // as this will break many apps that derive from this base class as they are expected to do.
  constructor(
    /** The ngrx store, scoped to the EntityCache */
    public readonly store: Store<EntityCache>,
    /** Factory to create a default instance of an EntityCollectionService */
    public readonly entityCollectionServiceFactory: EntityCollectionServiceFactory
  ) {
    this.entityCache$ = entityCollectionServiceFactory.entityCache$;
  }

  /** Dispatch any action to the store */
  dispatch(action: Action) {
    this.store.dispatch(action);
  }

  /**
   * Create a default instance of an EntityCollectionService
   * @param entityName {string} Name of the entity type of the service
   */
  protected createEntityCollectionService<T = any>(
    entityName: string
  ): EntityCollectionService<T> {
    return new EntityCollectionServiceBase<T>(
      entityName,
      this.entityCollectionServiceFactory
    );
  }

  /** Get (or create) the singleton instance of an EntityCollectionService
   * @param entityName {string} Name of the entity type of the service
   */
  getEntityCollectionService<T = any>(
    entityName: string
  ): EntityCollectionService<T> {
    let service = this.EntityCollectionServices[entityName];
    if (!service) {
      service = this.createEntityCollectionService(entityName);
      this.EntityCollectionServices[entityName] = service;
    }
    return service;
  }

  /** Register an EntityCollectionService under its entity type name.
   * Will replace a pre-existing service for that type.
   * @param service {EntityCollectionService} The entity service
   * @param serviceName {string} optional service name to use instead of the service's entityName
   */
  registerEntityCollectionService<T>(
    service: EntityCollectionService<T>,
    serviceName?: string
  ) {
    this.EntityCollectionServices[serviceName || service.entityName] = service;
  }

  /**
   * Register entity services for several entity types at once.
   * Will replace a pre-existing service for that type.
   * @param entityCollectionServices {EntityCollectionServiceMap | EntityCollectionService<any>[]}
   * EntityCollectionServices to register, either as a map or an array
   */
  registerEntityCollectionServices(
    entityCollectionServices:
      | EntityCollectionServiceMap
      | EntityCollectionService<any>[]
  ): void {
    if (Array.isArray(entityCollectionServices)) {
      entityCollectionServices.forEach(service =>
        this.registerEntityCollectionService(service)
      );
    } else {
      Object.keys(entityCollectionServices || {}).forEach(serviceName => {
        this.registerEntityCollectionService(
          entityCollectionServices[serviceName],
          serviceName
        );
      });
    }
  }
}
