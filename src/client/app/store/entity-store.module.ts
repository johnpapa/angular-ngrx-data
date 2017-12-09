import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import {
  EntityCache,
  EntityCollection,
  entityEffects,
  EntityDataServiceConfig,
  entityReducer,
  NgrxDataModule,
  PLURALIZER_NAMES
} from '../../ngrx-data';

const entityDataServiceConfig: EntityDataServiceConfig = {
  api: '/api',
  getDelay: 1000,
  saveDelay: 200
};

export function initialState() {
  const empty = new EntityCollection();
  return {
    Hero: empty,
    Villain: empty
  };
}

const pluralNames = {
  // Case matters. Match the case of the class name.
  Hero: 'Heroes'
};

@NgModule({
  imports: [
    StoreModule.forFeature('entityCache', entityReducer, { initialState }),
    EffectsModule.forFeature(entityEffects),
    NgrxDataModule
  ],
  providers: [
    { provide: PLURALIZER_NAMES, useValue: pluralNames },
    { provide: EntityDataServiceConfig, useValue: entityDataServiceConfig }
  ]
})
export class EntityStoreModule {}
