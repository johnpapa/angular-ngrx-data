import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { EntityEffects, EntityDataService, reducer } from '../../ngrx-data';

import { AppDataService, services } from './services';
import { initialEntityCache } from './app-entities';
import { appConfigReducers } from './app-config/reducer';
import { appConfigServices } from './app-config';

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
