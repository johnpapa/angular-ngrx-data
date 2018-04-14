import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { isE2E } from './e2e-check';

@Injectable()
export class ToastService {
  constructor(public snackBar: MatSnackBar) {}

  openSnackBar(message: string, action: string) {
    if (isE2E) {
      console.log(`${message} - ${action}`);
    } else {
      // setTimeout guards against `ExpressionChangedAfterItHasBeenCheckedError`
      setTimeout(() => {
        this.snackBar.open(message, action, {
          duration: 2000
        });
      }, 0);
    }
  }
}
