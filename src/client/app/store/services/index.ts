export * from './app-data.service';
export * from './hero-data.service';

// export * from './hero.dispatchers.old';
// export * from './hero.selectors.old';
// import { HeroDispatchers } from './hero.dispatchers.old';
// import { HeroSelectors } from './hero.selectors.old';

export * from './hero.dispatchers';
export * from './hero.selectors';
import { HeroDispatchers } from './hero.dispatchers';
import { HeroSelectors } from './hero.selectors';

import { AppDataService } from './app-data.service';
import { HeroDataService } from './hero-data.service';
import { EntityDataService } from '../ngrx-data';

export const services = [
  AppDataService,
  HeroDataService,
  HeroDispatchers,
  HeroSelectors,
  { provide: EntityDataService, useExisting: AppDataService }
];
