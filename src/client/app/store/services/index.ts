export * from './app-data.service';
export * from './hero-data.service';

// export * from './hero.dispatchers.old';
// export * from './hero.selectors.old';
// import { HeroDispatchers } from './hero.dispatchers.old';
// import { HeroSelectors } from './hero.selectors.old';

export * from './hero.dispatchers';
export * from './hero.selectors';
export * from './villain.dispatchers';
export * from './villain.selectors';
import { HeroDispatchers } from './hero.dispatchers';
import { HeroSelectors } from './hero.selectors';
import { VillainDispatchers } from './villain.dispatchers';
import { VillainSelectors } from './villain.selectors';

import { EntityDataService } from '../ngrx-data';
import { AppDataService } from './app-data.service';
import { HeroDataService } from './hero-data.service';
import { VillainDataService } from './villain-data.service';

export const services = [
  AppDataService,
  HeroDataService,
  HeroDispatchers,
  HeroSelectors,
  VillainDataService,
  VillainDispatchers,
  VillainSelectors,
  { provide: EntityDataService, useExisting: AppDataService }
];
