import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { debounceTime, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';

import { Villain } from '../core';
import { VillainDispatchers, VillainSelectors } from '../store/services';
import { AppSelectors } from '../store/app-config';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-villain-list',
  template: `
    <div>
      <div class="button-group">
        <button (click)="getVillains()">Refresh</button>
        <button (click)="enableAddMode()" *ngIf="!addingVillain && !selectedVillain">Add</button>
      </div>
      <div>
        <p>Filter the villains</p>
        <input [value]="filter$ | async" (input)="setFilter($event.target.value)"/>
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

  private onDestroy = new Subject();

  constructor(
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
      .pipe(debounceTime(500), distinctUntilChanged(), skip(1))
      .subscribe((val: string) => this.filterVillains());
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
  }

  setFilter(value: string) {
    this.villainDispatchers.setFilter(value);
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
