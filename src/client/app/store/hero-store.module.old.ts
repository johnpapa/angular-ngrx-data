import { NgModule } from '@angular/core';
import { StoreModule, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { reducers } from './reducers/hero.reducer';
import { HeroEffects } from './effects';
import { services } from './services';

@NgModule({
  imports: [StoreModule.forFeature('heroState', reducers), EffectsModule.forFeature([HeroEffects])],
  providers: [services],
  declarations: [],
  exports: [StoreModule, EffectsModule]
})
export class HeroStoreModule {}
