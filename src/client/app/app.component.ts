import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-toast></app-toast>
    <h1>{{ title }}</h1>
    <app-login></app-login>
    <div class="header-bar"></div>
    <app-hero-list></app-hero-list>
  `
})
export class AppComponent {
  title = 'Hi VS Live 360';
}
