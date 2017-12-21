import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AppSelectors } from '../../store/app-config';
import { EntityAction, EntityActions, EntityService, EntityServiceFactory } from '../../../ngrx-data';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';

import { Villain, ToastService } from '../../core';

@Component({
  selector: 'app-villain-search',
  templateUrl: './villains.component.html',
  styleUrls: ['./villains.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VillainSearchComponent implements OnDestroy, OnInit {
  addingVillain = false;
  selectedVillain: Villain = null;

  actions$: EntityActions<Villain>;
  dataSource$: Observable<string>;
  filteredVillains$: Observable<Villain[]>;
  loading$: Observable<boolean>;

  villainService: EntityService<Villain>;
  private onDestroy = new Subject();

  constructor(
    entityServiceFactory: EntityServiceFactory,
    appSelectors: AppSelectors,
    private toast: ToastService
  ) {
    this.dataSource$ = appSelectors.dataSource$();
    this.villainService = entityServiceFactory.create<Villain>('Villain');
    this.filteredVillains$ = this.villainService.filteredEntities$;
    this.loading$ = this.villainService.loading$;
  }

  ngOnInit() {
    this.dataSource$
      .pipe(takeUntil(this.onDestroy), distinctUntilChanged())
      .subscribe((value: string) => this.getVillains());

    this.villainService.actions$
      .filter(ea =>
        ea.op.includes(EntityAction.OP_SUCCESS) ||
        ea.op.includes(EntityAction.OP_ERROR)
      )
      .until(this.onDestroy)
      .subscribe(action => this.toast.openSnackBar(`${action.entityName} action`, action.op));
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  clear() {
    this.addingVillain = false;
    this.selectedVillain = null;
  }

  deleteVillain(villain: Villain) {
    this.unselect();
    this.villainService.delete(villain.id);
  }

  enableAddMode() {
    this.addingVillain = true;
    this.selectedVillain = null;
  }

  getVillains() {
    this.villainService.getAll();
    this.unselect();
  }

  onSelect(villain: Villain) {
    this.addingVillain = false;
    this.selectedVillain = villain;
  }

  update(villain: Villain) {
    this.villainService.update(villain);
  }

  add(villain: Villain) {
    this.villainService.add(villain);
  }

  unselect() {
    this.addingVillain = false;
    this.selectedVillain = null;
  }
}
