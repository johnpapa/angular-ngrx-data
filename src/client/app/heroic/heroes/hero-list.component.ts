import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { debounceTime, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';

import { Hero } from '../../core';
import { HeroDispatchers, HeroSelectors } from '../../store/services';
import { AppSelectors } from '../../store/app-config';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-hero-list',
  template: `
    <div>
      <div class="button-group">
        <button (click)="getHeroes()">Refresh</button>
        <button (click)="enableAddMode()" *ngIf="!addingHero && !selectedHero">Add</button>
      </div>
      <div>
        <p>Filter the heroes</p>
        <input [value]="filter$ | async" (input)="setFilter($event.target.value)"/>
      </div>
      <div *ngIf="filteredHeroes$ | async as heroes">

        <div *ngIf="loading$ | async;else heroList">Loading</div>

        <ng-template #heroList>
          <ul class="heroes">
            <li *ngFor="let hero of heroes"
              class="hero-container"
              [class.selected]="hero === selectedHero">
              <div class="hero-element">
                <div class="badge">{{hero.id}}</div>
                <div class="hero-text" (click)="onSelect(hero)">
                  <div class="name">{{hero.name}}</div>
                  <div class="saying">{{hero.saying}}</div>
                </div>
              </div>
              <button class="delete-button" (click)="deleteHero(hero)">Delete</button>
            </li>
          </ul>
        </ng-template>
      </div>

      <ng-template #elseTemplate>Loading ...</ng-template>
      <app-hero-detail
        *ngIf="selectedHero || addingHero"
        [hero]="selectedHero"
        (unselect)="unselect()"
        (add)="add($event)"
        (update)="update($event)">
      </app-hero-detail>
    </div>
  `,
  styleUrls: ['./hero-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroListComponent implements OnDestroy, OnInit {
  addingHero = false;
  selectedHero: Hero = null;

  filteredHeroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;
  filter$: Observable<string>;
  dataSource$ = this.appSelectors.dataSource$();
  searchText = '';

  private onDestroy = new Subject();

  constructor(
    private heroDispatchers: HeroDispatchers,
    private heroSelectors: HeroSelectors,
    private appSelectors: AppSelectors
  ) {}

  ngOnInit() {
    this.filteredHeroes$ = this.heroSelectors.filteredHeroes$();
    this.loading$ = this.heroSelectors.loading$();
    this.filter$ = this.heroSelectors.filter$();

    this.dataSource$
      .pipe(takeUntil(this.onDestroy), distinctUntilChanged())
      .subscribe((val: string) => this.getHeroes());

    this.filter$
      .pipe(takeUntil(this.onDestroy), debounceTime(500), distinctUntilChanged(), skip(1))
      .subscribe((val: string) => this.filterHeroes());
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
  }

  setFilter(value: string) {
    this.heroDispatchers.setFilter(value);
  }

  clear() {
    this.addingHero = false;
    this.selectedHero = null;
  }

  deleteHero(hero: Hero) {
    this.unselect();
    this.heroDispatchers.delete(hero);
  }

  enableAddMode() {
    this.addingHero = true;
    this.selectedHero = null;
  }

  filterHeroes() {
    this.heroDispatchers.getFiltered();
  }

  getHeroes() {
    this.heroDispatchers.getAll();
  }

  onSelect(hero: Hero) {
    this.addingHero = false;
    this.selectedHero = hero;
  }

  update(hero: Hero) {
    this.heroDispatchers.update(hero);
  }

  add(hero: Hero) {
    this.heroDispatchers.add(hero);
  }

  unselect() {
    this.addingHero = false;
    this.selectedHero = null;
  }
}
