import { ModuleWithProviders, NgModule, InjectionToken } from '@angular/core';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { EntityAction, EntityActionFactory, EntityActions } from './actions';

import {
  DefaultDataServiceFactory, EntityDataService,
  HttpUrlGenerator, DefaultHttpUrlGenerator,
  PersistenceResultHandler, DefaultPersistenceResultHandler
} from './dataservices';

import { EntityDispatcherFactory } from './dispatchers';

import {
  EntityDefinitionService,
  EntityMetadataMap,
  ENTITY_METADATA_TOKEN
} from './entity-metadata';

import { EntityEffects } from './effects';
import { EntityServiceFactory } from './entity-service';

import {
  createEntityReducer,
  EntityCache,
  ENTITY_CACHE_NAME,
  ENTITY_CACHE_NAME_TOKEN,
  EntityCollection,
  EntityCollectionCreator,
  ENTITY_COLLECTION_META_REDUCERS,
  EntityCollectionReducerFactory,
  EntityReducerFactory,
  ENTITY_REDUCER_TOKEN
} from './reducers';

import { EntitySelectors, EntitySelectors$Factory } from './selectors';
import { Pluralizer, DefaultPluralizer, PLURAL_NAMES_TOKEN } from './utils';

export const entityEffects: any[] = [EntityEffects];

export interface NgrxDataModuleConfig {
  entityMetadata?: EntityMetadataMap;
  entityCollectionMetaReducers?: MetaReducer<EntityCollection, EntityAction>[],
  pluralNames?: { [name: string]: string };
}

/**
 * Module without effects which means no HTTP calls
 * It is helpful for internal testing but not for users
 */
@NgModule({
  imports: [
    StoreModule.forFeature(ENTITY_CACHE_NAME, ENTITY_REDUCER_TOKEN),
  ],
  providers: [
    EntityActionFactory,
    EntityCollectionCreator,
    EntityCollectionReducerFactory,
    EntityDefinitionService,
    EntityDispatcherFactory,
    EntityReducerFactory,
    EntitySelectors$Factory,
    EntityServiceFactory,
    { provide: ENTITY_CACHE_NAME_TOKEN, useValue: ENTITY_CACHE_NAME },
    { provide: ENTITY_REDUCER_TOKEN,
      deps: [EntityReducerFactory],
      useFactory: createEntityReducer
    },
  ]
})
// tslint:disable-next-line:class-name
export class _NgrxDataModuleWithoutEffects {}

@NgModule({
  imports: [
    StoreModule.forFeature(ENTITY_CACHE_NAME, ENTITY_REDUCER_TOKEN),
    _NgrxDataModuleWithoutEffects,
    EffectsModule.forFeature(entityEffects)
  ],
  providers: [
    DefaultDataServiceFactory,
    EntityActions,
    EntityDataService,
    { provide: HttpUrlGenerator, useClass: DefaultHttpUrlGenerator },
    { provide: Pluralizer, useClass: DefaultPluralizer },
    { provide: PersistenceResultHandler, useClass: DefaultPersistenceResultHandler }
  ]
})
export class NgrxDataModule {
  static forRoot(config: NgrxDataModuleConfig): ModuleWithProviders {
    return {
      ngModule: NgrxDataModule,
      providers: [
        { provide: ENTITY_METADATA_TOKEN, multi: true,
          useValue: config.entityMetadata ? config.entityMetadata : []},
        { provide: ENTITY_COLLECTION_META_REDUCERS,
          useValue: config.entityCollectionMetaReducers ? config.entityCollectionMetaReducers : [] },
        { provide: PLURAL_NAMES_TOKEN, multi: true, useValue: config.pluralNames }
      ]
    };
  }
}
