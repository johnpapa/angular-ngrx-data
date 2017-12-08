import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule, Store, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';

import { storeFreeze } from 'ngrx-store-freeze';

import { AppEntityStoreModule } from './store/app-entity-store.module';
import { AppRoutingModule, routedComponents } from './app-routing.module';
import { CoreModule } from './core/core.module';

// TODO: learn about freeze
export const metaReducers: MetaReducer<any>[] = environment.production ? [] : []; // [storeFreeze];

@NgModule({
  imports: [
    BrowserModule,
    CoreModule,
    HttpClientModule,
    AppRoutingModule,
    AppEntityStoreModule,
    StoreModule.forRoot({}, { metaReducers }),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  declarations: [AppComponent, routedComponents],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
