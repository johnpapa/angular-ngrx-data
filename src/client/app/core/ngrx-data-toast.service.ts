import { Injectable, OnDestroy } from '@angular/core';
import { Actions } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { EntityAction } from '../../ngrx-data';

import { ToastService } from './toast.service';

/** Report ngrx-data success/error actions as toast messages **/
@Injectable()
export class NgrxDataToastService implements OnDestroy {
  private onDestroy = new Subject();

  constructor(actions$: Actions, toast: ToastService) {
    actions$
      .pipe(
        filter(
          (ea: EntityAction) =>
            ea.op &&
            (ea.op.includes(EntityAction.OP_SUCCESS) || ea.op.includes(EntityAction.OP_ERROR))
        ),
        takeUntil(this.onDestroy)
      )
      .subscribe(action => toast.openSnackBar(`${action.entityName} action`, action.op));
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }
}
