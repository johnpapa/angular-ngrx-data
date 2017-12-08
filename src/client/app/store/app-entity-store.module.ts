import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { EntityEffects, EntityDataService, reducer } from '../../ngrx-data';

import { AppDataService, services } from './services';
import { initialEntityCache } from './app-entities';

@NgModule({
  imports: [
    StoreModule.forFeature('entityCache', reducer, { initialState: initialEntityCache }),
    EffectsModule.forFeature([EntityEffects])
  ],
  providers: [services, { provide: EntityDataService, useExisting: AppDataService }],
  exports: [EffectsModule, StoreModule]
})
export class AppEntityStoreModule {}
