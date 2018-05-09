import { NgModule } from '@angular/core';

import {
  DefaultDataServiceConfig,
  EntityHttpResourceUrls,
  EntityServices,
  Logger,
  NgrxDataModule,
  Pluralizer
} from 'ngrx-data';

import { AppEntityServices } from './app-entity-services';

import { AppPluralizer, AppLogger } from '../app-utils';
import { entityMetadata } from './entity-metadata';
import { NgrxDataToastService } from './ngrx-data-toast.service';
import { isE2E } from '../../core';

const defaultDataServiceConfig: DefaultDataServiceConfig = {
  root: 'api', // default root path to the server's web api

  // Optionally specify resource URLS for HTTP calls
  entityHttpResourceUrls: {
    // Case matters. Match the case of the entity name.
    Hero: {
      // You must specify the root as part of the resource URL.
      entityResourceUrl: 'api/hero/',
      collectionResourceUrl: 'api/heroes/'
    }
  },

  timeout: 3000, // request timeout

  // Simulate latency for demo
  getDelay: isE2E ? 0 : 500,
  saveDelay: isE2E ? 0 : 800
};

@NgModule({
  imports: [
    NgrxDataModule.forRoot({
      entityMetadata: entityMetadata
    })
  ],
  providers: [
    AppEntityServices,
    { provide: EntityServices, useExisting: AppEntityServices },
    { provide: DefaultDataServiceConfig, useValue: defaultDataServiceConfig },
    { provide: Logger, useClass: AppLogger },
    { provide: Pluralizer, useClass: AppPluralizer },
    NgrxDataToastService
  ]
})
export class EntityStoreModule {
  constructor(
    // Inject NgrxDataToastService to start it listening
    toastService: NgrxDataToastService
  ) {}
}
