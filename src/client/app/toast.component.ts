import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from './toast.service';

import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector: 'app-toast',
  template: `
    <div id="toast" class="toast-container">
      <div class="toast-card mdl-shadow--16dp">
        <p class="toast-message">{{message}}</p>
      </div>
    </div>
  `
})
export class ToastComponent implements OnDestroy, OnInit {
  private defaults = {
    message: 'May the Force be with You'
  };
  private toastElement: any;
  private toastSubscription: Subscription;
  private onDestroy = new Subject();

  message: string;

  constructor(private toastService: ToastService) {
    this.toastSubscription = this.toastService.toastState
      .takeUntil(this.onDestroy)
      .subscribe((toastMessage) => {
        console.log(`activiting toast: ${toastMessage.message}`);
        this.activate(toastMessage.message);
      });
  }

  activate(message = this.defaults.message) {
    this.message = message;
    this.show();
  }

  ngOnInit() {
    this.toastElement = document.getElementById('toast');
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
    // this.toastSubscription.unsubscribe();
  }

  private show() {
    console.log(this.message);
    this.toastElement.style.opacity = 1;
    this.toastElement.style.zIndex = 9999;

    window.setTimeout(() => this.hide(), 2500);
  }

  private hide() {
    this.toastElement.style.opacity = 0;
    window.setTimeout(() => this.toastElement.style.zIndex = 0, 400);
  }
}
