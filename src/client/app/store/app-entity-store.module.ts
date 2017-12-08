import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  EntityCache,
  EntityCollection,
  EntityEffects,
  EntityDataService,
  reducer
} from '../../ngrx-data';

import { AppDataService, services } from './services';
import { Hero, Villain } from '../core';
import { appConfigReducers } from './app-config/reducer';
import { appConfigServices } from './app-config';

// This has to be an object and not a new() due to AOT
const initialEntityCollectionState: EntityCollection<any> = {
  filter: '',
  entities: [],
  filteredEntities: [],
  loading: false
};

const initialEntityCache: EntityCache = {
  Hero: initialEntityCollectionState,
  Villain: initialEntityCollectionState
};

@NgModule({
  imports: [
    StoreModule.forFeature('entityCache', reducer, { initialState: initialEntityCache }),
    StoreModule.forFeature('appConfig', appConfigReducers),
    EffectsModule.forFeature([EntityEffects])
  ],
  providers: [
    services,
    appConfigServices,
    { provide: EntityDataService, useExisting: AppDataService }
  ],
  exports: [EffectsModule, StoreModule]
})
export class AppEntityStoreModule {}
