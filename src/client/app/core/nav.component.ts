import { Component, OnInit, Optional, EventEmitter } from '@angular/core';

import { InMemoryDataService } from '../core';
import { AppDispatchers } from '../store/custom';

@Component({
  selector: 'app-nav',
  template: `
    <div>
      <div class="header-bar"></div>
      <nav>
        <a routerLink="/dashboard" routerLinkActive="router-link-active">Dashboard</a>
        <a routerLink="/heroic/heroes" routerLinkActive="router-link-active">Heroes</a>
        <a routerLink="/heroic/villains" routerLinkActive="router-link-active">Villains</a>
      </nav>
      <div class="header-bar"></div>
      <div class="button-group">
        <button (click)="toggleDataSource()" *ngIf="nextDataSource">{{nextDataSource}}</button>
      </div>
    </div>
  `,
  styles: [
    `
    nav a {
      padding: 5px 10px;
      text-decoration: none;
      margin-top: 10px;
      margin-left: 2px;
      margin-bottom: 6px;
      display: inline-block;
      border-radius: 4px;
    }
    nav a:visited, a:link {
      color: #607D8B;
    }
    nav a:hover {
      color: #039be5;
    }
    nav a.router-link-active {
      color: #039be5;
    }
    .header-bar {
      background-color: rgb(0, 120, 215);
      height: 4px;
      margin-top: 10px;
      margin-bottom: 10px;
    }
    `
  ]
})
export class NavComponent {
  nextDataSource: string;

  constructor(
    @Optional() private inMemService: InMemoryDataService,
    private appDispatchers: AppDispatchers
  ) {
    if (inMemService) {
      this.nextDataSource = 'Go Remote';
    }
  }

  toggleDataSource() {
    const localSource = this.nextDataSource === 'Go Local';
    this.inMemService.active = localSource;
    this.nextDataSource = localSource ? 'Go Remote' : 'Go Local';
    const location = localSource ? 'local' : 'remote';
    this.appDispatchers.toggleDataSource(location);
  }
}
