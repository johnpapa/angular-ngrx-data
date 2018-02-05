import { ModuleWithProviders, NgModule, InjectionToken } from '@angular/core';
import { ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { DefaultDataServiceFactory } from './default-data.service';
import { EntityActions } from './entity.actions';
import {
  EntityDataServiceConfig,
  EntityCache,
  ENTITY_CACHE_NAME,
  ENTITY_CACHE_NAME_TOKEN,
  CREATE_ENTITY_DISPATCHER_TOKEN,
  ENTITY_METADATA_TOKEN,
  ENTITY_REDUCER_TOKEN,
  PLURAL_NAMES_TOKEN
} from './interfaces';
import { EntityDataService } from './entity-data.service';
import { EntityDefinitionService } from './entity-definition.service';
import { EntityEffects } from './entity.effects';
import { createEntityDispatcher } from './entity-dispatcher';
import { createEntityReducer } from './entity.reducer';
import { EntityMetadataMap } from './entity-metadata';
import { EntitySelectors } from './entity.selectors';
import { EntityServiceFactory } from './entity.service';
import { HttpUrlGenerator, DefaultHttpUrlGenerator } from './http-url-generator';
import { Pluralizer, DefaultPluralizer } from './pluralizer';

export const entityEffects: any[] = [EntityEffects];

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
    DefaultDataServiceFactory,
    EntityActions,
    EntityDataService,
    EntityDataServiceConfig,
    EntityDefinitionService,
    EntityServiceFactory,
    { provide: ENTITY_CACHE_NAME_TOKEN, useValue: ENTITY_CACHE_NAME },
    { provide: CREATE_ENTITY_DISPATCHER_TOKEN, useValue: createEntityDispatcher },
    {
      provide: ENTITY_REDUCER_TOKEN,
      deps: [EntityDefinitionService],
      useFactory: createEntityReducer
    },
    { provide: HttpUrlGenerator, useClass: DefaultHttpUrlGenerator },
    { provide: Pluralizer, useClass: DefaultPluralizer }
  ]
})
export class NgrxDataModule {
  static forRoot(config: NgrxDataModuleConfig): ModuleWithProviders {
    return {
      ngModule: NgrxDataModule,
      providers: [
        { provide: EntityDataServiceConfig, useValue: config.entityDataServiceConfig },
        { provide: ENTITY_METADATA_TOKEN, multi: true, useValue: config.entityMetadata },
        { provide: PLURAL_NAMES_TOKEN, multi: true, useValue: config.pluralNames }
      ]
    };
  }
}
