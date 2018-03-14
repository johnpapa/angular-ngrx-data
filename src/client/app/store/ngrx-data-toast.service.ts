import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { EntityAction, EntityActions, OP_ERROR, OP_SUCCESS } from 'ngrx-data';
import { ToastService } from '../core/toast.service';

/** Report ngrx-data success/error actions as toast messages **/
@Injectable()
export class NgrxDataToastService {
  constructor(actions$: EntityActions, toast: ToastService) {
    actions$
      .where(ea => ea.op.includes(OP_SUCCESS) || ea.op.includes(OP_ERROR))
      // this service never dies so no need to unsubscribe
      .subscribe(action =>
        toast.openSnackBar(`${action.entityName} action`, action.op)
      );
  }
}
