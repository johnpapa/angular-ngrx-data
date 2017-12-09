export * from './dispatchers';
export * from './selectors';
export * from './reducer';

import { AppDispatchers } from './dispatchers';
import { AppSelectors } from './selectors';

export const appConfigServices = [AppDispatchers, AppSelectors];
