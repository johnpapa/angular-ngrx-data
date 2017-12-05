export * from './actions';
export * from './effects';
export * from './reducers';
export * from './hero-data.service';
export * from './hero.service';

import { HeroDataService } from './hero-data.service';
import { HeroService } from './hero.service';

export const services = [HeroDataService, HeroService];
