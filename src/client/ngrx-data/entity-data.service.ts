import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EntityAction } from './entity.actions';
import { EntityCollectionDataService } from './interfaces';

@Injectable()
export class EntityDataServiceConfig {
  api? = '/api';
  getDelay? = 0;
  saveDelay? = 0;
  timeout? = 0;
}

import { BasicDataService } from './basic-data.service';
import { Pluralizer } from './pluralizer';

@Injectable()
export class EntityDataService {
  api: string; // base of data service URL, like '/api'
  // Fake delays to simulate network latency
  getDelay: number;
  saveDelay: number;
  timeout: number;

  private services: { [name: string]: EntityCollectionDataService<any> } = {};

  // TODO:  Optionally inject specialized entity data services
  // for those that aren't derived from BaseDataService.
  constructor(
    config: EntityDataServiceConfig,
    private http: HttpClient,
    private pluralizer: Pluralizer
  ) {
    config = config || {};
    this.api = config.api != null ? '/api' : config.api;
    this.getDelay = config.getDelay || 0;
    this.saveDelay = config.saveDelay || 0;
    this.timeout = config.timeout || 0;
  }

  /**
   * Get (or create) a data service for entity type
   * @param entityName - the name of the type
   *
   * Examples:
   *   getService('Hero'); // data service for Heroes, untyped
   *   getService<Hero>('Hero'); // data service for Heroes, typed as Hero
   */
  getService<T>(entityName: string): EntityCollectionDataService<T> {
    entityName = entityName.trim();
    let service = this.services[entityName];
    if (!service) {
      const entitiesName = this.pluralizer.pluralize(entityName);
      service = new BasicDataService(this.http, {
        api: this.api,
        entityName,
        entitiesName,
        getDelay: this.getDelay,
        saveDelay: this.saveDelay,
        timeout: this.timeout,
      });
      this.services[entityName] = service;
    }
    return service;
  }

  /**
   * Register an EntityCollectionDataService for an entity type
   * @param entityName - the name of the entity type
   * @param service - data service for that entity type
   *
   * Examples:
   *   registerService('Hero', MyHeroDataService);
   *   registerService('Villain', MyVillainDataService);
   */
  registerService<T>(entityName: string, service: EntityCollectionDataService<T>) {
    this.services[entityName.trim()] = service;
  }

  /**
   * Register a batch of data services.
   * @param services - data services to merge into existing services
   *
   * Examples:
   *   registerServices({
   *     Hero: MyHeroDataService,
   *     Villain: MyVillainDataService
   *   });
   */
  registerServices(services: { [name: string]: EntityCollectionDataService<any> }) {
    this.services = { ...this.services, ...services };
  }
}
