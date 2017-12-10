import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <div>
    <app-toolbar></app-toolbar>
    <div class="content">
      <router-outlet></router-outlet>
    </div>
  </div>
  `,
  styles: [
    `
    .content {
      margin: 1em;
    }
  `
  ]
})
export class AppComponent {}
