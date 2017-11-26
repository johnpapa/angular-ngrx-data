import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeroService } from './hero.service';
import { HeroesComponent } from './hero-list.component';
import { HeroDetailComponent } from './hero-detail.component';

@NgModule({
  declarations: [AppComponent, HeroesComponent, HeroDetailComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  providers: [HeroService],
  bootstrap: [AppComponent]
})
export class AppModule {}
