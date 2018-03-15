import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { isE2E } from './e2e-check';

@Injectable()
export class ToastService {
  constructor(public snackBar: MatSnackBar) {
    if (isE2E) {
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
