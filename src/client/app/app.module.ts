import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule, Store, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';

import { storeFreeze } from 'ngrx-store-freeze';

import { HeroStoreModule } from './store/hero-store.module';
import { HeroesComponent } from './containers/heroes/heroes.component';
import { HeroListComponent } from './components/hero-list.component';
import { HeroDetailComponent } from './components/hero-detail.component';

// TODO: learn about freeze
export const metaReducers: MetaReducer<any>[] = environment.production ? [] : []; // [storeFreeze];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    // ReactiveFormsModule, // I could add this and then use FormControl with valueChanges
    HttpClientModule,
    HeroStoreModule,
    StoreModule.forRoot({}, { metaReducers }),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  declarations: [AppComponent, HeroesComponent, HeroListComponent, HeroDetailComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
