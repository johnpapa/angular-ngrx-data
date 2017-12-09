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
  PLURALIZER_NAMES,
} from '../../ngrx-data';

import { appConfigReducers, appConfigServices } from './app-config';

// This has to be an object and not a new() due to AOT
const initialEntityCollectionState = new EntityCollection();

const initialEntityCache: EntityCache = {
  Hero: initialEntityCollectionState,
  Villain: initialEntityCollectionState
};

const entityDataServiceConfig: EntityDataServiceConfig = {
  api: '/api',
  getDelay: 1000,
  saveDelay: 200
}

const pluralNames = {
  hero: 'heroes'
};

@NgModule({
  imports: [
    StoreModule.forFeature('entityCache', entityReducer, { initialState: initialEntityCache }),
    StoreModule.forFeature('appConfig', appConfigReducers),
    EffectsModule.forFeature([EntityEffects]),
    NgrxDataModule,
  ],
  providers: [
    appConfigServices,
    { provide: PLURALIZER_NAMES, useValue: pluralNames },
    { provide: EntityDataServiceConfig, useValue: entityDataServiceConfig }
  ],
  exports: [EffectsModule, StoreModule]
})
export class AppEntityStoreModule {}
