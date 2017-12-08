import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { EntityEffects, EntityDataService, reducer } from '../../ngrx-data';

import { AppDataService, services } from './services';
import { initialEntityCache } from './app-entities';
import { customReducers } from './custom/reducer';
import { customServices } from './custom';

@NgModule({
  imports: [
    StoreModule.forFeature('entityCache', reducer, { initialState: initialEntityCache }),
    StoreModule.forFeature('appCache', customReducers),
    EffectsModule.forFeature([EntityEffects])
  ],
  providers: [
    services,
    customServices,
    { provide: EntityDataService, useExisting: AppDataService }
  ],
  exports: [EffectsModule, StoreModule]
})
export class AppEntityStoreModule {}
