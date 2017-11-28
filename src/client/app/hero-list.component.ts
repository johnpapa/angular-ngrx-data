import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Hero } from './model';
import { HeroService, HeroState } from './store';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs/operators';

@Component({
  selector: 'app-hero-list',
  template: `
    <div>
      <div class="button-group">
        <button (click)="getHeroes('')">Refresh</button>
        <button (click)="enableAddMode()" *ngIf="!addingHero && !selectedHero">Add</button>
      </div>
      <div>
        <p>Filter the heroes</p>
        <input [value]="searchTerms$ | async" (input)="search($event.target.value)"/>
      </div>
      <div class="todos" *ngIf="heroes$ | async as heroes">

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

      <ng-template #elseTemplate>Loading</ng-template>
      <app-hero-detail
        *ngIf="selectedHero || addingHero"
        [hero]="selectedHero"
        (unselect)="unselect()"
        (heroChanged)="save($event)">
      </app-hero-detail>
    </div>
  `,
  styleUrls: [`./hero-list.component.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroListComponent implements OnInit {
  addingHero = false;
  heroes: Hero[] = [];
  selectedHero: Hero = null;

  heroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;
  searchCriteria$: Observable<string>;
  public searchTerms$: Observable<string>;

  constructor(private heroService: HeroService) {}

  ngOnInit() {
    this.heroes$ = this.heroService.heroes$();
    this.loading$ = this.heroService.loading$();
    this.searchCriteria$ = this.heroService.searchCriteria$().pipe(skip(1));

    // this.getHeroes('');

    this.searchCriteria$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((val: string) => this.getHeroes(val));
  }

  search(value: string) {
    this.heroService.setSearchCriteria(value);
  }

  clear() {
    this.addingHero = false;
    this.selectedHero = null;
  }

  deleteHero(hero: Hero) {
    this.unselect();
    this.heroService.deleteHero(hero);
  }

  enableAddMode() {
    this.addingHero = true;
    this.selectedHero = null;
  }

  getHeroes(criteria: string) {
    this.heroService.getHeroes(criteria);
  }

  onSelect(hero: Hero) {
    this.addingHero = false;
    this.selectedHero = hero;
  }

  save(arg: { mode: 'add' | 'update'; hero: Hero }) {
    this.heroService.saveHero(arg.hero, arg.mode);
  }

  unselect() {
    this.addingHero = false;
    this.selectedHero = null;
  }
}
