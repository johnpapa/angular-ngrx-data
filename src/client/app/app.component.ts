import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <div>
    <h1>{{ title }}</h1>
    <app-nav></app-nav>
    <router-outlet></router-outlet>
  </div>
  `
})
export class AppComponent {
  title = 'Angular Heroes';
}
