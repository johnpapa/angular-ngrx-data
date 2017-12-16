import { ModuleWithProviders, NgModule, InjectionToken } from '@angular/core';
import { ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { EntityCache } from './interfaces';
import { EntityDataService, EntityDataServiceConfig } from './entity-data.service';
import { EntityDefinitionService, ENTITY_METADATA } from './entity-definition.service';
import { EntityDispatcherService } from './entity-dispatcher.service';
import { EntityEffects } from './entity.effects';
import { EntityMetadataMap } from './entity-metadata';
import { EntitySelectors } from './entity.selectors';
import { EntitySelectorsService } from './entity-selectors.service';
import { Pluralizer, _Pluralizer, PLURALIZER_NAMES } from './pluralizer';

export const entityEffects: any[] = [EntityEffects];

export const ENTITY_REDUCER_TOKEN = new InjectionToken<ActionReducer<EntityCache>>(
  'Entity Reducer'
);

export function getEntityReducer(service: EntityDefinitionService) {
  return service.getEntityReducer();
}

export interface NgrxDataModuleConfig {
  entityDataServiceConfig?: EntityDataServiceConfig;
  entityMetadata?: EntityMetadataMap;
  pluralNames?: { [name: string]: string };
}

@NgModule({
  imports: [
    StoreModule.forFeature('entityCache', ENTITY_REDUCER_TOKEN),
    EffectsModule.forFeature(entityEffects)
  ],
  providers: [
    EntityDataService,
    EntityDataServiceConfig,
    EntityDefinitionService,
    EntityDispatcherService,
    EntitySelectorsService,
    {
      provide: ENTITY_REDUCER_TOKEN,
      deps: [EntityDefinitionService],
      useFactory: getEntityReducer
    },

    { provide: Pluralizer, useClass: _Pluralizer }
  ]
})
export class NgrxDataModule {
  static forRoot(config: NgrxDataModuleConfig = {}): ModuleWithProviders {
    return {
      ngModule: NgrxDataModule,
      providers: [
        { provide: EntityDataServiceConfig, useValue: config.entityDataServiceConfig },
        { provide: ENTITY_METADATA, multi: true, useValue: config.entityMetadata },
        { provide: PLURALIZER_NAMES, useValue: config.pluralNames }
      ]
    };
  }
}
