import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import {
  EntityCache,
  EntityCollection,
  EntityEffects,
  EntityDataServiceConfig,
  entityReducer,
  NgrxDataModule,
  PLURALIZER_NAMES
} from '../../ngrx-data';

export function initialState() {
  const empty = new EntityCollection();
  return {
    Hero: empty,
    Villain: empty
  };
}

const entityDataServiceConfig: EntityDataServiceConfig = {
  api: '/api',
  getDelay: 1000,
  saveDelay: 200
};

const pluralNames = {
  hero: 'heroes'
};

@NgModule({
  imports: [
    StoreModule.forFeature('entityCache', entityReducer, { initialState }),
    EffectsModule.forFeature([EntityEffects]),
    NgrxDataModule
  ],
  providers: [
    { provide: PLURALIZER_NAMES, useValue: pluralNames },
    { provide: EntityDataServiceConfig, useValue: entityDataServiceConfig }
  ]
})
export class EntityStoreModule {}
