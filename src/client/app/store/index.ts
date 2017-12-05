export * from './actions';
export * from './effects';
export * from './reducers';
export * from './services';

import { HeroDispatchers, HeroDataService, HeroSelectors } from './services';

export const services = [HeroDataService, HeroDispatchers, HeroSelectors];
