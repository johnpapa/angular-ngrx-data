import { Injectable } from '@angular/core';
import { EntityActions, OP_ERROR, OP_SUCCESS } from 'ngrx-data';
import { ToastService } from '../core/toast.service';

/** Report ngrx-data success/error actions as toast messages **/
@Injectable()
export class NgrxDataToastService {
  constructor(actions$: EntityActions, toast: ToastService) {
    actions$
      .where(ea => ea.op.endsWith(OP_SUCCESS) || ea.op.endsWith(OP_ERROR))
      // this service never dies so no need to unsubscribe
      .subscribe(action =>
        toast.openSnackBar(`${action.entityName} action`, action.op)
      );
  }
}
