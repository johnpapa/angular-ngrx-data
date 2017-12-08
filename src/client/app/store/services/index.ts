export * from './app-data.service';
export * from './hero.dispatchers';
export * from './hero.selectors';
export * from './pluralizer';
export * from './villain.dispatchers';
export * from './villain.selectors';

import { EntityDataService } from '../../../ngrx-data';

import { AppDataService } from './app-data.service';
import { HeroDispatchers } from './hero.dispatchers';
import { HeroSelectors } from './hero.selectors';
import { Pluralizer } from './pluralizer';
import { VillainDispatchers } from './villain.dispatchers';
import { VillainSelectors } from './villain.selectors';

export const services = [
  AppDataService,
  HeroDispatchers,
  HeroSelectors,
  Pluralizer,
  VillainDispatchers,
  VillainSelectors,
  { provide: EntityDataService, useExisting: AppDataService }
];
