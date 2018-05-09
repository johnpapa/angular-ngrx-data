import { NgModule } from '@angular/core';
import { StoreModule, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
// import { storeFreeze } from 'ngrx-store-freeze';

import { appConfigReducers, appConfigServices } from './app-config';
import { EntityStoreModule } from './entity/entity-store.module';

import { environment } from '../../environments/environment';

export const metaReducers: MetaReducer<any>[] = environment.production
  ? []
  : []; // [storeFreeze];

@NgModule({
  imports: [
    StoreModule.forRoot({}, { metaReducers }),
    EffectsModule.forRoot([]),
    StoreModule.forFeature('appConfig', appConfigReducers),
    EntityStoreModule,
    environment.production ? [] : StoreDevtoolsModule.instrument()
  ],
  providers: [appConfigServices]
})
export class AppStoreModule {}
