import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeroService } from './hero.service';
import { HeroListComponent } from './hero-list.component';
import { HeroDetailComponent } from './hero-detail.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HeroEffects } from './hero.effects';
import { reducers } from './hero.reducer';

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
  providers: [HeroService],
  bootstrap: [AppComponent]
})
export class AppModule {}
