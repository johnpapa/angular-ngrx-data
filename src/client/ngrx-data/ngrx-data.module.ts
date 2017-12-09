import { NgModule } from '@angular/core';

import { Pluralizer, Pluralizer_, PLURALIZER_NAMES } from './pluralizer';
import { EntityDispatchers } from './entity.dispatchers';
import { EntitySelectors } from './entity.selectors';
import { EntityDataService, EntityDataServiceConfig } from './entity-data.service';

@NgModule({
  providers: [
    EntityDataService,
    EntityDataServiceConfig,
    EntityDispatchers,
    EntitySelectors,
    { provide: PLURALIZER_NAMES, useValue: {} },
    { provide: Pluralizer, useClass: Pluralizer_ }
  ]
})
export class NgrxDataModule {}
