import { Component, OnInit } from '@angular/core';

import { HeroService } from './hero.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-login',
  template: `
    <div>
      <button (click)="login()" [hidden]="isLoggedIn">Login</button>
      <button (click)="logout()" [hidden]="!isLoggedIn">Logout</button>
      <div class="logged-in-as"><p [hidden]="!username">Logged in as {{username}}</p></div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  isLoggedIn = false;
  username: string;

  constructor(private heroService: HeroService, private toastService: ToastService) {}

  ngOnInit() {
    this.heroService.getProfile().subscribe(result => {
      this.username = result.username;
      this.isLoggedIn = !!this.username;
    });
  }

  login() {
    window.location.href = `${window.location.protocol}//${window.location.host}/api/login`;
  }

  logout() {
    this.heroService.logout().subscribe(result => {
      this.toastService.activate(`you logged out, don't go, it makes us sad`);
      console.log(result);
      this.username = '';
      this.isLoggedIn = false;
    });
  }
}
