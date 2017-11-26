import { Component, OnInit } from '@angular/core';

import { Hero } from './hero';
import { HeroService } from './hero.service';

@Component({
  selector: 'app-hero-list',
  template: `
    <div>
      <div class="button-group">
        <button (click)="getHeroes()">Refresh</button>
        <button (click)="enableAddMode()" *ngIf="!addingHero && !selectedHero">Add</button>
      </div>
      <ul class="heroes" *ngIf="heroes && heroes.length">
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
export class HeroesComponent implements OnInit {
  addingHero = false;
  heroes: Hero[] = [];
  selectedHero: Hero = null;

  constructor(private heroService: HeroService) {}

  ngOnInit() {
    this.getHeroes();
  }

  clear() {
    this.addingHero = false;
    this.selectedHero = null;
  }

  deleteHero(hero: Hero) {
    this.heroService.deleteHero(hero).subscribe(res => {
      this.heroes = this.heroes.filter((h: Hero) => h !== hero);
      if (this.selectedHero === hero) {
        this.selectedHero = null;
      }
    });
  }

  enableAddMode() {
    this.addingHero = true;
    this.selectedHero = null;
  }

  getHeroes() {
    this.heroes = [];
    this.clear();
    return this.heroService.getHeroes().subscribe(heroes => {
      this.heroes = heroes;
    });
  }

  onSelect(hero: Hero) {
    this.addingHero = false;
    this.selectedHero = hero;
  }

  save(arg: { mode: string; hero: Hero }) {
    const hero = arg.hero;
    console.log('hero changed', hero);
    if (arg.mode === 'add') {
      this.heroService.addHero(hero).subscribe(() => {
        this.addingHero = false;
        this.selectedHero = null;
        this.heroes.push(hero);
      });
    } else {
      this.heroService.updateHero(hero).subscribe(() => {
        const index = this.heroes.findIndex((h: Hero) => hero.id === h.id);
        this.heroes.splice(index, 1, hero);
        this.clear();
      });
    }
  }

  unselect() {
    this.addingHero = false;
    this.selectedHero = null;
  }
}
