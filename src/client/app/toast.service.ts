import { Injectable, Optional, SkipSelf } from '@angular/core';

import { Subject } from 'rxjs/Subject';

// import 'rxjs/Rx'; // TODO: These aren't the imports you are looking for

export interface ToastMessage {
  message: string;
}

@Injectable()
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();

  toastState = this.toastSubject.asObservable();

  constructor(@Optional() @SkipSelf() prior: ToastService) {
    if (prior) {
      console.log('toast service already exists');
      return prior;
    } else {
      console.log('created toast service');
    }
  }

  activate(message?: string) {
    this.toastSubject.next(<ToastMessage>{ message: message });
  }
}
