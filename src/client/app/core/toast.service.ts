import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class ToastService {
  isE2E = false;

  constructor(public snackBar: MatSnackBar) {
    if (window.location.search.includes('e2e')) {
      this.openSnackBar = (message: string, action: string) => {
        console.log(`${message} - ${action}`);
      };
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000
    });
  }
}
