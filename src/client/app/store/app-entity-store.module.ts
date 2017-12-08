import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  EntityCache,
  EntityCollection,
  EntityEffects,
  EntityDataService,
  initialEntityCollectionState,
  reducer
} from '../../ngrx-data';

import { AppDataService, services } from './services';
import { Hero, Villain } from '../core';
import { appConfigReducers } from './app-config/reducer';
import { appConfigServices } from './app-config';

const initialEntityCache: EntityCache = {
  Hero: initialEntityCollectionState as EntityCollection<Hero>,
  Villain: initialEntityCollectionState as EntityCollection<Villain>
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
