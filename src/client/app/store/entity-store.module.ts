import { NgModule } from '@angular/core';

import { EntityDataServiceConfig, NgrxDataModule } from '../../ngrx-data';

import { pluralNames, entityMetadata } from './entity-metadata';

const entityDataServiceConfig: EntityDataServiceConfig = {
  api: '/api',
  getDelay: 300,
  saveDelay: 100
};

@NgModule({
  imports: [
    NgrxDataModule.forRoot({
      entityDataServiceConfig,
      entityMetadata: entityMetadata,
      pluralNames: pluralNames
    })
  ]
})
export class EntityStoreModule {}
