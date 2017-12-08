import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  EntityAction,
  EntityCache,
  EntityClass,
  EntityCollection,
  EntityDataService,
  EntityCollectionDataService
} from '../../../ngrx-data';

import { BasicDataService } from './basic-data.service';
import { Pluralizer } from './pluralizer';

@Injectable()
export class AppDataService implements EntityDataService {

  // Fake delays to simulate network latency
  getDelay = 1000;
  saveDelay = 200;

  private services: { [name: string]: EntityCollectionDataService<any> } = { };

  // TODO:  Optionally inject specialized entity data services
  // for those that aren't derived from BaseDataService.
  constructor(private http: HttpClient, private pluralizer: Pluralizer) { }

  /**
   * Get (or create) a data service for entity type
   * @param entityClass - the name of the class or the class itself
   *
   * Examples:
   *   getService(Hero);   // data service for Heroes, typed as Hero
   *   getService('Hero'); // data service for Heroes, untyped
   */
  getService<T>(entityClass: string | EntityClass<T>): EntityCollectionDataService<T> {

    const entityName =
      (typeof entityClass === 'string' ? entityClass : entityClass.name)
      .toLowerCase();

    let service = this.services[entityName];

    if (!service) {
      const entitiesName = this.pluralizer.pluralize(entityName);
      service = new BasicDataService(this.http, {
          entityName,
          entitiesName,
          getDelay: this.getDelay,
          saveDelay: this.saveDelay
        });
      this.services[entityName] = service;
    }
    return service;
  }
}
