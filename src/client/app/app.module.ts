import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule, Store, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';
import { HeroService, HeroDataService, HeroEffects, reducers } from './store';
import { HeroListComponent } from './hero-list.component';
import { HeroDetailComponent } from './hero-detail.component';

import { storeFreeze } from 'ngrx-store-freeze';

export const metaReducers: MetaReducer<any>[] = environment.production ? [] : [storeFreeze];

@NgModule({
  declarations: [AppComponent, HeroListComponent, HeroDetailComponent],
  imports: [
    BrowserModule,
    FormsModule,
    // ReactiveFormsModule, // I could add this and then use FormControl with valueChanges
    HttpClientModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([HeroEffects]),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  providers: [HeroDataService, HeroService],
  bootstrap: [AppComponent]
})
export class AppModule {}
