import { Injectable, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { EntityAction, EntityActions, OP_ERROR, OP_SUCCESS } from 'ngrx-data';

import { ToastService } from '../core/toast.service';

/** Report ngrx-data success/error actions as toast messages **/
@Injectable()
export class NgrxDataToastService implements OnDestroy {
  private subscription: Subscription;

  constructor(actions$: EntityActions, toast: ToastService) {
    this.subscription = actions$
    .where(ea => ea.op.includes(OP_SUCCESS) || ea.op.includes(OP_ERROR))
    .subscribe(action =>
      toast.openSnackBar(`${action.entityName} action`, action.op)
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
