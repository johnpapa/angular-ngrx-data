export * from './app-data.service';
export * from './hero-data.service';
export * from './hero.dispatchers';
export * from './hero.selectors';

import { EntityDataService } from '../ngrx-data';

import { AppDataService } from './app-data.service';
import { HeroDataService } from './hero-data.service';
import { HeroDispatchers } from './hero.dispatchers';
import { HeroSelectors } from './hero.selectors';

export const services = [
  HeroDataService, HeroDispatchers, HeroSelectors
];
