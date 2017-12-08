export * from './dispatchers';
export * from './selectors';

import { AppDispatchers } from './dispatchers';
import { AppSelectors } from './selectors';

export const appConfigServices = [AppDispatchers, AppSelectors];
