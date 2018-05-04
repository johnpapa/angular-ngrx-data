import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Hero, MasterDetailCommands } from '../../core';

@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroListComponent {
  @Input() heroes: Hero[];
  @Input() selectedHero: Hero;
  @Input() commands: MasterDetailCommands<Hero>;

  byId(hero: Hero) {
    return hero.id;
  }

  onSelect(hero: Hero) {
    this.commands.select(hero);
  }

  deleteHero(hero: Hero) {
    this.commands.delete(hero);
  }
}
