import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AppSelectors } from '../../store/app-config';
import { EntityDispatcher, EntityService, EntitySelectors$ } from '../../../ngrx-data';


import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, skip, takeUntil, take, tap } from 'rxjs/operators';

import { Villain, ToastService } from '../../core';
import { pipe } from 'rxjs/util/pipe';

@Component({
  selector: 'app-villain-search',
  templateUrl: './villains.component.html',
  styleUrls: ['./villains.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VillainSearchComponent implements OnDestroy, OnInit {
  addingVillain = false;
  selectedVillain: Villain = null;

  filteredVillains$: Observable<Villain[]>;
  villains$: Observable<Villain[]>;
  loading$: Observable<boolean>;
  dataSource$ = this.appSelectors.dataSource$();

  private onDestroy = new Subject();
  private villainDispatcher: EntityDispatcher<Villain>;
  private villainSelector: EntitySelectors$<Villain>;

  constructor(
    entityService: EntityService,
    private appSelectors: AppSelectors,
    private toast: ToastService
  ) {
    this.villainDispatcher = entityService.getDispatcher(Villain);
    this.villainSelector = entityService.getSelectors$(Villain);
  }

  ngOnInit() {
    this.filteredVillains$ = this.villainSelector.selectFilteredEntities$;
    this.villains$ = this.villainSelector.selectAll$;
    this.loading$ = this.villainSelector.selectLoading$;

    this.dataSource$
      .pipe(takeUntil(this.onDestroy), distinctUntilChanged())
      .subscribe((value: string) => this.getVillains());

    this.villains$
      .pipe(takeUntil(this.onDestroy), skip(1))
      .subscribe(villains => this.toast.openSnackBar('Fetched Villains', 'GET'));
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
    this.villainDispatcher.delete(villain.id);
  }

  enableAddMode() {
    this.addingVillain = true;
    this.selectedVillain = null;
  }

  getVillains() {
    this.villainDispatcher.getAll();
    this.unselect();
  }

  onSelect(villain: Villain) {
    this.addingVillain = false;
    this.selectedVillain = villain;
  }

  update(villain: Villain) {
    this.villainDispatcher.update(villain);
  }

  add(villain: Villain) {
    this.villainDispatcher.add(villain);
  }

  unselect() {
    this.addingVillain = false;
    this.selectedVillain = null;
  }
}
