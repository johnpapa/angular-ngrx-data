import { Injectable, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { EntityAction, EntityActions, OP_ERROR, OP_SUCCESS } from 'ngrx-data';

import { ToastService } from '../core/toast.service';

/** Report ngrx-data success/error actions as toast messages **/
@Injectable()
export class NgrxDataToastService implements OnDestroy {
  private onDestroy = new Subject();

  constructor(actions$: EntityActions, toast: ToastService) {
    actions$.pipe(
      filter(ea => ea.op.includes(OP_SUCCESS) || ea.op.includes(OP_ERROR)),
      takeUntil(this.onDestroy)
    )
    .subscribe(action =>
      toast.openSnackBar(`${action.entityName} action`, action.op)
    );
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }
}
