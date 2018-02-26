import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable } from 'rxjs/Observable';

import { FilterObserver } from '../../shared/filter';
import { Hero } from '../../core';
import { HeroesService } from '../heroes.service';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss'],
  providers: [ HeroesService ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroesComponent implements OnInit {
  addingHero = false;
  selectedHero: Hero;

  filterObserver: FilterObserver;
  filteredHeroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;

  constructor(public heroesService: HeroesService) {
    this.filterObserver = heroesService.filterObserver;
    this.filteredHeroes$ = this.heroesService.filteredEntities$;
    this.loading$ = this.heroesService.loading$;
  }

  ngOnInit() {
    this.heroesService.initialize();
  }

  clear() {
    this.addingHero = false;
    this.selectedHero = null;
  }

  deleteHero(hero: Hero) {
    this.unselect();
    this.heroesService.delete(hero);
  }

  enableAddMode() {
    this.addingHero = true;
    this.selectedHero = null;
  }

  getHeroes() {
    this.heroesService.getAll();
    this.unselect();
  }

  onSelect(hero: Hero) {
    this.addingHero = false;
    this.selectedHero = hero;
  }

  update(hero: Hero) {
    this.heroesService.update(hero);
  }

  add(hero: Hero) {
    this.heroesService.add(hero);
  }

  unselect() {
    this.addingHero = false;
    this.selectedHero = null;
  }
}
