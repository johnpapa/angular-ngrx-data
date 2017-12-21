import { ModuleWithProviders, NgModule, InjectionToken } from '@angular/core';
import { ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { EntityActions } from './entity.actions';
import { EntityCache, ENTITY_CACHE_NAME, ENTITY_CACHE_NAME_TOKEN,
  ENTITY_METADATA_TOKEN, ENTITY_REDUCER_TOKEN,
  PLURAL_NAMES_TOKEN } from './interfaces';
import { EntityDataService, EntityDataServiceConfig } from './entity-data.service';
import { EntityDefinitionService } from './entity-definition.service';
import { EntityEffects } from './entity.effects';
import { EntityMetadataMap } from './entity-metadata';
import { EntitySelectors } from './entity.selectors';
import { EntityServiceFactory } from './entity.service';
import { Pluralizer, _Pluralizer } from './pluralizer';

export const entityEffects: any[] = [EntityEffects];

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
    StoreModule.forFeature(ENTITY_CACHE_NAME, ENTITY_REDUCER_TOKEN),
    EffectsModule.forFeature(entityEffects)
  ],
  providers: [
    EntityActions,
    EntityDataService,
    EntityDataServiceConfig,
    EntityDefinitionService,
    EntityServiceFactory,
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
        { provide: ENTITY_CACHE_NAME_TOKEN, useValue: ENTITY_CACHE_NAME },
        { provide: EntityDataServiceConfig, useValue: config.entityDataServiceConfig },
        { provide: ENTITY_METADATA_TOKEN, multi: true, useValue: config.entityMetadata },
        { provide: PLURAL_NAMES_TOKEN, useValue: config.pluralNames }
      ]
    };
  }
}
