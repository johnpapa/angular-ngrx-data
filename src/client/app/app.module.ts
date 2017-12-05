import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { StoreModule, Store, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';

import { storeFreeze } from 'ngrx-store-freeze';

import { HeroStoreModule } from './store/hero-store.module';
import { HeroesComponent } from './containers/heroes/heroes.component';
import { HeroListComponent } from './components/hero-list.component';
import { HeroDetailComponent } from './components/hero-detail.component';

import { reducers, effects } from './store';

// TODO: learn about freeze
export const metaReducers: MetaReducer<any>[] = environment.production ? [] : []; // [storeFreeze];


// routes
// export const ROUTES: Routes = [
//   { path: '', pathMatch: 'full', redirectTo: 'products' },
//   {
//     path: 'heroes',
//     loadChildren: '../store/products.module#ProductsModule',
//   },
// ];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    // ReactiveFormsModule, // I could add this and then use FormControl with valueChanges
    HttpClientModule,
    HeroStoreModule,
    // RouterModule.forRoot(routes),

    // StoreModule.forRoot({}, { metaReducers }),
    // EffectsModule.forRoot([]),

    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot(effects),

    // StoreModule.forFeature('heroic', reducers),
    // EffectsModule.forFeature(effects),

    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  declarations: [AppComponent, HeroesComponent, HeroListComponent, HeroDetailComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
