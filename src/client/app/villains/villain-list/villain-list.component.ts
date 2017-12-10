import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AppSelectors } from '../../store/app-config';
import {
  EntityDispatchers,
  EntityDispatcher,
  EntitySelectors,
  EntitySelector
} from '../../../ngrx-data';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, skip, takeUntil, take, tap } from 'rxjs/operators';

import { Villain, ToastService } from '../../core';
import { pipe } from 'rxjs/util/pipe';

@Component({
  selector: 'app-villain-list',
  templateUrl: './villain-list.component.html',
  styleUrls: ['./villain-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VillainListComponent implements OnDestroy, OnInit {
  addingVillain = false;
  selectedVillain: Villain = null;

  filteredVillains$: Observable<Villain[]>;
  villains$: Observable<Villain[]>;
  loading$: Observable<boolean>;
  filter$: Observable<string>;
  dataSource$ = this.appSelectors.dataSource$();
  filter: FormControl = new FormControl();

  private onDestroy = new Subject();
  private villainDispatcher: EntityDispatcher<Villain>;
  private villainSelector: EntitySelector<Villain>;
  private filterLogic = pipe(
    takeUntil(this.onDestroy),
    tap(value => this.filter.setValue(value)),
    debounceTime(300),
    distinctUntilChanged()
  );

  constructor(
    private entityDispatchers: EntityDispatchers,
    private entitySelectors: EntitySelectors,
    private appSelectors: AppSelectors,
    private toast: ToastService
  ) {
    this.villainDispatcher = entityDispatchers.getDispatcher(Villain);
    this.villainSelector = entitySelectors.getSelector(Villain);
  }

  ngOnInit() {
    this.filteredVillains$ = this.villainSelector.filteredEntities$();
    this.villains$ = this.villainSelector.entities$();
    this.loading$ = this.villainSelector.loading$();
    this.filter$ = this.villainSelector.filter$();

    this.dataSource$
      .pipe(takeUntil(this.onDestroy), distinctUntilChanged())
      .subscribe((value: string) => this.getVillains());

    this.filter$.pipe(this.filterLogic).subscribe(value => this.filterVillains());

    this.villains$
      .pipe(takeUntil(this.onDestroy), skip(1))
      .subscribe(villains => this.toast.openSnackBar('Fetched Villains', 'GET'));
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
  }

  setFilter(value: string) {
    this.villainDispatcher.setFilter(value);
    this.clear();
  }

  clear() {
    this.addingVillain = false;
    this.selectedVillain = null;
  }

  deleteVillain(villain: Villain) {
    this.unselect();
    this.villainDispatcher.delete(villain);
  }

  enableAddMode() {
    this.addingVillain = true;
    this.selectedVillain = null;
  }

  filterVillains() {
    this.villainDispatcher.getFiltered();
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
