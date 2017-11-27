import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Hero } from './model';
import { HeroService } from './store';

@Component({
  selector: 'app-hero-list',
  template: `
    <div>
      <div class="button-group">
        <button (click)="getHeroes()">Refresh</button>
        <button (click)="enableAddMode()" *ngIf="!addingHero && !selectedHero">Add</button>
      </div>
      <ul class="heroes" *ngIf="heroes$ | async as heroes">
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

  constructor(private heroService: HeroService) {}

  ngOnInit() {
    this.heroes$ = this.heroService.heroes$();
    this.getHeroes();

    // // Debugging only
    // this.heroes$.subscribe((heroes: Hero[]) => {
    //   console.log('here are the heroes in the component');
    //   console.log(heroes);
    // });
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

  getHeroes() {
    this.heroService.getHeroes();
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
