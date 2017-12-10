import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <div>
    <app-toolbar></app-toolbar>
    <div class="content">
      <mat-card>
        <mat-card-content>
          <router-outlet></router-outlet>
        </mat-card-content>
      </mat-card>
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
