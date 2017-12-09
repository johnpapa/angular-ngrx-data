import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';

import { Villain } from '../core';
import { VillainDispatchers, VillainSelectors } from '../store/services';
import { AppSelectors } from '../store/app-config';

@Component({
  selector: 'app-villain-list',
  template: `
    <div>
      <form [formGroup]="form">
        <div class="button-group">
          <button type="button" (click)="getVillains()">Refresh</button>
          <button type="button" (click)="enableAddMode()" *ngIf="!addingVillain && !selectedVillain">Add</button>
        </div>
        <div>
          <p>Filter the villains</p>
          <input formControlName="filter" (input)="setFilter(form)"/>
        </div>
        <div *ngIf="filteredVillains$ | async as villains">
          <div *ngIf="loading$ | async;else villainList">Loading</div>
          <ng-template #villainList>
            <ul class="villains">
              <li *ngFor="let villain of villains"
                class="villain-container"
                [class.selected]="villain === selectedVillain">
                <div class="villain-element">
                  <div class="badge">{{villain.id}}</div>
                  <div class="villain-text" (click)="onSelect(villain)">
                    <div class="name">{{villain.name}}</div>
                    <div class="saying">{{villain.saying}}</div>
                  </div>
                </div>
                <button class="delete-button" (click)="deleteVillain(villain)">Delete</button>
              </li>
            </ul>
          </ng-template>
        </div>
      </form>
      <ng-template #elseTemplate>Loading ...</ng-template>
      <app-villain-detail
        *ngIf="selectedVillain || addingVillain"
        [villain]="selectedVillain"
        (unselect)="unselect()"
        (add)="add($event)"
        (update)="update($event)">
      </app-villain-detail>
    </div>
  `,
  styleUrls: ['./villain-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VillainListComponent implements OnDestroy, OnInit {
  addingVillain = false;
  selectedVillain: Villain = null;

  filteredVillains$: Observable<Villain[]>;
  loading$: Observable<boolean>;
  filter$: Observable<string>;
  dataSource$ = this.appSelectors.dataSource$();
  form = this.fb.group({
    filter: [''],
  });

  private onDestroy = new Subject();

  constructor(
    private fb: FormBuilder,
    private villainDispatchers: VillainDispatchers,
    private villainSelectors: VillainSelectors,
    private appSelectors: AppSelectors
  ) {}

  ngOnInit() {
    this.filteredVillains$ = this.villainSelectors.filteredVillains$();
    this.loading$ = this.villainSelectors.loading$();
    this.filter$ = this.villainSelectors.filter$();

    this.dataSource$
      .pipe(takeUntil(this.onDestroy), distinctUntilChanged())
      .subscribe((val: string) => this.getVillains());

    this.filter$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((val: string) => this.filterVillains());
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
  }

  setFilter(form: FormGroup) {
    const { value, valid, touched } = form;
    if (valid) {
      this.villainDispatchers.setFilter(value.filter);
    }
    this.clear();
  }

  clear() {
    this.addingVillain = false;
    this.selectedVillain = null;
  }

  deleteVillain(villain: Villain) {
    this.unselect();
    this.villainDispatchers.delete(villain);
  }

  enableAddMode() {
    this.addingVillain = true;
    this.selectedVillain = null;
  }

  filterVillains() {
    this.villainDispatchers.getFiltered();
  }

  getVillains() {
    this.villainDispatchers.getAll();
    this.unselect();
  }

  onSelect(villain: Villain) {
    this.addingVillain = false;
    this.selectedVillain = villain;
  }

  update(villain: Villain) {
    this.villainDispatchers.update(villain);
  }

  add(villain: Villain) {
    this.villainDispatchers.add(villain);
  }

  unselect() {
    this.addingVillain = false;
    this.selectedVillain = null;
  }
}
