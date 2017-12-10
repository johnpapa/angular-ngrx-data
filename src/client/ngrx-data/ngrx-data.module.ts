import { NgModule, InjectionToken } from '@angular/core';
import { ActionReducer } from '@ngrx/store';

import { EntityCache } from './interfaces';
import { EntityDataService, EntityDataServiceConfig } from './entity-data.service';
import { EntityDispatchers } from './entity.dispatchers';
import { EntitySelectors } from './entity.selectors';
import { EntityFilterService, ENTITY_FILTERS, DefaultEntityFilters} from './entity-filter.service';
import { EntityReducer } from './entity.reducer';
import { Pluralizer, _Pluralizer, PLURALIZER_NAMES } from './pluralizer';

export const ENTITY_REDUCER_TOKEN =
  new InjectionToken<ActionReducer<EntityCache>>('Entity Reducer');

export function getReducer(entityReducer: EntityReducer) {
  return entityReducer.getReducer();
}

@NgModule({
  providers: [
    EntityDataService,
    EntityDataServiceConfig,
    EntityDispatchers,
    EntitySelectors,
    EntityFilterService,
    EntityReducer,
    { provide: ENTITY_FILTERS, multi: true, useValue: DefaultEntityFilters },
    { provide: ENTITY_REDUCER_TOKEN, deps: [EntityReducer], useFactory: getReducer},
    { provide: PLURALIZER_NAMES, useValue: {} },
    { provide: Pluralizer, useClass: _Pluralizer }
  ]
})
export class NgrxDataModule {}
