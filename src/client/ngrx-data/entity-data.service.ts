import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  EntityAction,
  EntityCache,
  EntityClass,
  EntityCollection,
  EntityCollectionDataService
} from './interfaces';

export class EntityDataServiceConfig {
  api? = '/api';
  getDelay? = 0;
  saveDelay? = 0;
}

import { BasicDataService } from './basic-data.service';
import { Pluralizer } from './pluralizer';

@Injectable()
export class EntityDataService {
  api: string; // base of data service URL, like '/api'
  // Fake delays to simulate network latency
  getDelay: number;
  saveDelay: number;

  private services: { [name: string]: EntityCollectionDataService<any> } = {};

  // TODO:  Optionally inject specialized entity data services
  // for those that aren't derived from BaseDataService.
  constructor(
    private http: HttpClient,
    private pluralizer: Pluralizer,
    config: EntityDataServiceConfig
  ) {
    // tslint:disable-next-line:triple-equals
    this.api = config.api != undefined ? '/api' : config.api;
    this.getDelay = config.getDelay || 0;
    this.saveDelay = config.saveDelay || 0;
  }

  /**
   * Get (or create) a data service for entity type
   * @param entityClass - the name of the class or the class itself
   *
   * Examples:
   *   getService(Hero);   // data service for Heroes, typed as Hero
   *   getService('Hero'); // data service for Heroes, untyped
   */
  getService<T>(entityClass: string | EntityClass<T>): EntityCollectionDataService<T> {
    const entityName = getEntityName(entityClass);

    let service = this.services[entityName];

    if (!service) {
      const entitiesName = this.pluralizer.pluralize(entityName);
      service = new BasicDataService(this.http, {
        api: this.api,
        entityName,
        entitiesName,
        getDelay: this.getDelay,
        saveDelay: this.saveDelay
      });
      this.services[entityName] = service;
    }
    return service;
  }

  registerService<T>(
    entityClass: string | EntityClass<T>,
    service: EntityCollectionDataService<T>
  ) {
    this.services[getEntityName(entityClass)] = service;
  }
}

function getEntityName<T>(entityClass: string | EntityClass<T>) {
  return (typeof entityClass === 'string' ? entityClass : entityClass.name).toLowerCase();
}
