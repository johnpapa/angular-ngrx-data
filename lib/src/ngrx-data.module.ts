import { ModuleWithProviders, NgModule, InjectionToken } from '@angular/core';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { EffectsModule, EffectSources } from '@ngrx/effects';

import { EntityAction, EntityActionFactory } from './actions/entity-action';
import { EntityActions } from './actions/entity-actions';

import { DefaultDataServiceFactory } from './dataservices/default-data.service';
import { EntityDataService } from './dataservices/entity-data.service';
import {
  PersistenceResultHandler,
  DefaultPersistenceResultHandler
} from './dataservices/persistence-result-handler.service';

import {
  HttpUrlGenerator,
  DefaultHttpUrlGenerator
} from './dataservices/http-url-generator';

import { EntityDispatcherFactory } from './dispatchers/entity-dispatcher-factory';

import { EntityDefinitionService } from './entity-metadata/entity-definition.service';
import {
  EntityMetadataMap,
  ENTITY_METADATA_TOKEN
} from './entity-metadata/entity-metadata';

import { EntityEffects } from './effects/entity-effects';
import { EntityServiceFactory } from './entity-service/entity.service';

import { EntityCache } from './reducers/entity-cache';
import { EntityCollection } from './reducers/entity-collection';
import { EntityCollectionCreator } from './reducers/entity-collection-creator';
import { EntityCollectionReducerFactory } from './reducers/entity-collection.reducer';
import {
  createEntityReducer,
  EntityReducerFactory
} from './reducers/entity-reducer';
import {
  ENTITY_CACHE_NAME,
  ENTITY_CACHE_NAME_TOKEN,
  ENTITY_COLLECTION_META_REDUCERS,
  ENTITY_REDUCER_TOKEN
} from './reducers/constants';

import { EntitySelectors } from './selectors/entity-selectors';
import { EntitySelectors$Factory } from './selectors/entity-selectors$';
import {
  Pluralizer,
  DefaultPluralizer,
  PLURAL_NAMES_TOKEN
} from './utils/pluralizer';

export interface NgrxDataModuleConfig {
  entityMetadata?: EntityMetadataMap;
  entityCollectionMetaReducers?: MetaReducer<EntityCollection, EntityAction>[];
  pluralNames?: { [name: string]: string };
}

/**
 * Module without effects which means no HTTP calls
 * It is helpful for internal testing but not for users
 */
@NgModule({
  imports: [StoreModule.forFeature(ENTITY_CACHE_NAME, ENTITY_REDUCER_TOKEN)],
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
    {
      provide: ENTITY_REDUCER_TOKEN,
      deps: [EntityReducerFactory],
      useFactory: createEntityReducer
    }
  ]
})
// tslint:disable-next-line:class-name
export class _NgrxDataModuleWithoutEffects {}

/**
 * Ngrx-data main module
 * Configure with `forRoot`.
 * No `forFeature` yet.
 */
@NgModule({
  imports: [
    _NgrxDataModuleWithoutEffects,
    EffectsModule.forFeature([]) // do not supply effects because can't replace later
  ],
  providers: [
    DefaultDataServiceFactory,
    EntityActions,
    EntityDataService,
    { provide: HttpUrlGenerator, useClass: DefaultHttpUrlGenerator },
    { provide: Pluralizer, useClass: DefaultPluralizer },
    {
      provide: PersistenceResultHandler,
      useClass: DefaultPersistenceResultHandler
    }
  ]
})
export class NgrxDataModule {
  static forRoot(config: NgrxDataModuleConfig): ModuleWithProviders {
    return {
      ngModule: NgrxDataModule,
      providers: [
        EntityEffects,
        {
          provide: ENTITY_METADATA_TOKEN,
          multi: true,
          useValue: config.entityMetadata ? config.entityMetadata : []
        },
        {
          provide: ENTITY_COLLECTION_META_REDUCERS,
          useValue: config.entityCollectionMetaReducers
            ? config.entityCollectionMetaReducers
            : []
        },
        {
          provide: PLURAL_NAMES_TOKEN,
          multi: true,
          useValue: config.pluralNames
        }
      ]
    };
  }

  constructor(
    private effectSources: EffectSources,
    entityEffects: EntityEffects
  ) {
    // Warning: relies on undocumented API to add effect directly rather than through `forFeature()`.
    // The danger is that EffectsModule.forFeature evolves and we no longer perform a crucial step.
    // We can't use `forFeature()` because, if we did, the developer could not
    // replace the ngrx-data `EntityEffects` with a custom alternative.
    // Replacing that class is an extensibility point we need.
    this.addEffects(entityEffects);
  }

  /**
   * Add another class instance that contains @Effect methods.
   * @param effectSourceInstance a class instance that implements effects.
   * Warning: undocumented @ngrx/effects API
   */
  addEffects(effectSourceInstance: any) {
    this.effectSources.addEffects(effectSourceInstance);
  }
}
