import { NgModule } from '@angular/core';

import { DefaultDataServiceConfig, NgrxDataModule } from 'ngrx-data';

import { pluralNames, entityMetadata } from './entity-metadata';

const defaultDataServiceConfig: DefaultDataServiceConfig = {
  root: 'api',    // root path to web api
  timeout: 3000, // request timeout

  // Simulate latency for demo
  getDelay: 500,
  saveDelay: 800,
};

@NgModule({
  imports: [
    NgrxDataModule.forRoot({
      entityMetadata: entityMetadata,
      pluralNames: pluralNames
    })
  ],
  providers: [
    { provide: DefaultDataServiceConfig, useValue: defaultDataServiceConfig }
  ]
})
export class EntityStoreModule {}
