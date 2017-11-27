import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Hero } from './hero';
import { HeroService } from './hero.service';
import * as HeroAction from './hero.action';
import { heroReducer, selectHeroes, HeroState, State } from './hero.reducer';

@Component({
  selector: 'app-hero-list',
  template: `
    <div>
      <div class="button-group">
        <button (click)="getHeroes()">Refresh</button>
        <button (click)="enableAddMode()" *ngIf="!addingHero && !selectedHero">Add</button>
      </div>
      <!--
        <pre>{{heroState$ | async | json}}</pre>
      -->
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
  styleUrls: [`./hero-list.component.scss`]
})
export class HeroListComponent implements OnInit {
  addingHero = false;
  heroes: Hero[] = [];
  selectedHero: Hero = null;

  heroes$: Observable<Hero[]>;
  heroState$: Observable<HeroState>;

  constructor(private store: Store<State>, private heroService: HeroService) {}

  ngOnInit() {
    this.heroState$ = this.store.select(state => state.hero);
    this.heroes$ = this.store.select(state => state.hero.heroes);
    this.getHeroes();

    // // Debugging only
    // this.heroes$.subscribe((heroes: Hero[]) => {
    //   console.log('here are the heroes in the component');
    //   console.log(heroes);
    // });

    console.log('store', this.store);
    console.log('heroStates$', this.heroes$);
  }

  clear() {
    this.addingHero = false;
    this.selectedHero = null;
  }

  deleteHero(hero: Hero) {
    this.store.dispatch(new HeroAction.DeleteHero(hero));
  }

  enableAddMode() {
    this.addingHero = true;
    this.selectedHero = null;
  }

  getHeroes() {
    this.store.dispatch(new HeroAction.GetHeroes());
  }

  onSelect(hero: Hero) {
    this.addingHero = false;
    this.selectedHero = hero;
    console.log('selected', this.selectedHero);
  }

  save(arg: { mode: string; hero: Hero }) {
    const hero = arg.hero;
    console.log('hero changed', hero);
    if (arg.mode === 'add') {
      this.store.dispatch(new HeroAction.AddHero(hero));
    } else {
      this.store.dispatch(new HeroAction.UpdateHero(hero));
    }
  }

  unselect() {
    this.addingHero = false;
    this.selectedHero = null;
  }
}
