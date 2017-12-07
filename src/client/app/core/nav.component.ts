import { Component, OnInit } from '@angular/core';

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
export class NavComponent {}
