import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeroDataService } from './hero-data.service';
import { HeroListComponent } from './hero-list.component';
import { HeroDetailComponent } from './hero-detail.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HeroEffects } from './hero.effects';
import { reducers } from './hero.reducer';
import { HeroService } from './hero.service';

@NgModule({
  declarations: [AppComponent, HeroListComponent, HeroDetailComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    StoreModule.forRoot(reducers),
    // StoreModule.forRoot({ reducers }), // TODO: this is not working
    EffectsModule.forRoot([HeroEffects])
  ],
  providers: [HeroDataService, HeroService],
  bootstrap: [AppComponent]
})
export class AppModule {}
