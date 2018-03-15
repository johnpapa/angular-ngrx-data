import { NgModule } from '@angular/core';

import { DefaultDataServiceConfig, NgrxDataModule } from 'ngrx-data';

import { entityMetadata, pluralNames } from './entity-metadata';
import { NgrxDataToastService } from './ngrx-data-toast.service';
import { isE2E } from '../core';

const defaultDataServiceConfig: DefaultDataServiceConfig = {
  root: 'api',    // root path to web api
  timeout: 3000, // request timeout

  // Simulate latency for demo
  getDelay: isE2E ? 0 : 500,
  saveDelay: isE2E ? 0 : 800,
};

@NgModule({
  imports: [
    NgrxDataModule.forRoot({
      entityMetadata: entityMetadata,
      pluralNames: pluralNames
    })
  ],
  providers: [
    NgrxDataToastService,
    { provide: DefaultDataServiceConfig, useValue: defaultDataServiceConfig }
  ]
})
export class EntityStoreModule {
    // Inject NgrxDataToastService to start it listening
    constructor( toastService: NgrxDataToastService) { }
}
