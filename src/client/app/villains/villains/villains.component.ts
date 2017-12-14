import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AppSelectors } from '../../store/app-config';
import {
  EntityDispatcherService,
  EntityDispatcher,
  EntitySelectorsService,
  EntitySelectors$
} from '../../../ngrx-data';

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
  filter$: Observable<string>;
  dataSource$ = this.appSelectors.dataSource$();
  filterPattern: string;

  private onDestroy = new Subject();
  private villainDispatcher: EntityDispatcher<Villain>;
  private villainSelector: EntitySelectors$<Villain>;

  constructor(
    dispatcherService: EntityDispatcherService,
    selectorsService: EntitySelectorsService,
    private appSelectors: AppSelectors,
    private toast: ToastService
  ) {
    this.villainDispatcher = dispatcherService.getDispatcher(Villain);
    this.villainSelector = selectorsService.getSelectors$(Villain);
  }

  ngOnInit() {
    this.filteredVillains$ = this.villainSelector.selectFilteredEntities$;
    this.villains$ = this.villainSelector.selectAll$;
    this.loading$ = this.villainSelector.selectLoading$;
    this.filter$ = this.villainSelector.selectFilter$;

    this.dataSource$
      .pipe(takeUntil(this.onDestroy), distinctUntilChanged())
      .subscribe((value: string) => this.getVillains());

    this.filter$.pipe(takeUntil(this.onDestroy)).subscribe(value => {
      this.filterPattern = value;
    });

    this.villains$
      .pipe(takeUntil(this.onDestroy), skip(1))
      .subscribe(villains => this.toast.openSnackBar('Fetched Villains', 'GET'));
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
  }

  setFilter(pattern: string) {
    this.villainDispatcher.setFilter(pattern);
    this.clear();
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
