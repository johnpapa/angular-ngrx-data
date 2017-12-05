import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { StoreModule, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { reducers } from './reducers';
import { effects } from './effects';
import { services } from './';

@NgModule({
  imports: [
    CommonModule,
    // FormsModule,
    HttpClientModule,
    // StoreModule.forFeature('heroic', reducers),
    // EffectsModule.forFeature(effects)
  ],
  providers: [...services],
  declarations: [],
  exports: [] // re-export our compoennts
})
export class HeroStoreModule {}
