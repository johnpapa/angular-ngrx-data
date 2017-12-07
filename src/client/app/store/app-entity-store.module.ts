import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { EntityEffects, EntityDataService, reducers } from './ngrx-data';
import { services, AppDataService } from './services';

import { initialEntityCache } from './app-entities';

@NgModule({
  imports: [
    StoreModule.forFeature('entityState', reducers, initialEntityCache ),
    EffectsModule.forFeature([EntityEffects])
  ],
  providers: [
    services,
    { provide: EntityDataService, useExisting: AppDataService }
  ],
  exports: [StoreModule, EffectsModule]
})
export class HeroStoreModule {}
