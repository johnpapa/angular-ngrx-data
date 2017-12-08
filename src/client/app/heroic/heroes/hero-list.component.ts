import { Component, OnInit, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs/operators';

import { InMemoryDataService } from '../../core';
import { Hero } from '../../core';
import { HeroDispatchers, HeroSelectors } from '../../store/services';

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
        (heroChanged)="save($event)">
      </app-hero-detail>
    </div>
  `,
  styleUrls: ['./hero-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroListComponent implements OnInit {
  addingHero = false;
  selectedHero: Hero = null;

  filteredHeroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;
  filter$: Observable<string>;
  searchText = '';

  constructor(private heroDispatchers: HeroDispatchers, private heroSelectors: HeroSelectors) {}

  ngOnInit() {
    this.filteredHeroes$ = this.heroSelectors.filteredHeroes$();
    this.loading$ = this.heroSelectors.loading$();
    this.filter$ = this.heroSelectors.filter$();

    this.getHeroes();

    this.filter$
      .pipe(debounceTime(500), distinctUntilChanged(), skip(1))
      .subscribe((val: string) => this.filterHeroes());
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

  save(arg: { mode: 'add' | 'update'; hero: Hero }) {
    this.heroDispatchers.save(arg.hero, arg.mode);
  }

  unselect() {
    this.addingHero = false;
    this.selectedHero = null;
  }
}
