import { ModuleWithProviders, NgModule, Inject, Injector, InjectionToken, Optional, OnDestroy } from '@angular/core';

import { Action, ActionReducer, combineReducers, MetaReducer, ReducerManager, StoreModule } from '@ngrx/store';

import { CorrelationIdGenerator } from './utils/correlation-id-generator';
import { DefaultDispatcherOptions } from './dispatchers/default-dispatcher-options';
import { EntityAction } from './actions/entity-action';
import { EntityActionFactory } from './actions/entity-action-factory';
import { EntityCache } from './reducers/entity-cache';
import { entityCacheSelectorProvider } from './selectors/entity-cache-selector';
import { EntityCollectionServiceFactory } from './entity-services/entity-services-interfaces';
import { DefaultEntityCollectionServiceFactory } from './entity-services/default-entity-collection-service-factory';
import { EntityCollection } from './reducers/entity-collection';
import { EntityCollectionCreator } from './reducers/entity-collection-creator';
import { EntityCollectionReducerFactory, EntityCollectionReducerMethodsFactory } from './reducers/entity-collection-reducer';
import { DefaultEntityCollectionReducerMethodsFactory } from './reducers/default-entity-collection-reducer-methods';
import { EntityDispatcherFactory } from './dispatchers/entity-dispatcher-factory';
import { EntityDefinitionService } from './entity-metadata/entity-definition.service';
import { EntityEffects } from './effects/entity-effects';
import { EntityMetadataMap, ENTITY_METADATA_TOKEN } from './entity-metadata/entity-metadata';

import { createEntityReducer, EntityReducerFactory } from './reducers/entity-reducer';
import {
  ENTITY_CACHE_NAME,
  ENTITY_CACHE_NAME_TOKEN,
  ENTITY_CACHE_META_REDUCERS,
  ENTITY_COLLECTION_META_REDUCERS,
  ENTITY_CACHE_REDUCER,
  INITIAL_ENTITY_CACHE_STATE
} from './reducers/constants';

import { Logger, Pluralizer, PLURAL_NAMES_TOKEN } from './utils/interfaces';

import { EntitySelectors } from './selectors/entity-selectors';
import { EntitySelectorsFactory } from './selectors/entity-selectors';
import { EntitySelectors$Factory } from './selectors/entity-selectors$';
import { EntityServices } from './entity-services/entity-services-interfaces';
import { EntityServicesBase } from './entity-services/entity-services-base';

import { DefaultLogger } from './utils/default-logger';
import { DefaultPluralizer } from './utils/default-pluralizer';

export interface NgrxDataModuleConfig {
  entityMetadata?: EntityMetadataMap;
  entityCacheMetaReducers?: (MetaReducer<EntityCache, Action> | InjectionToken<MetaReducer<EntityCache, Action>>)[];
  entityCollectionMetaReducers?: MetaReducer<EntityCollection, EntityAction>[];
  // Initial EntityCache state or a function that returns that state
  initialEntityCacheState?: EntityCache | (() => EntityCache);
  pluralNames?: { [name: string]: string };
}

/**
 * Module without effects or dataservices which means no HTTP calls
 * This module helpful for internal testing.
 * Also helpful for apps that handle server access on their own and
 * therefore opt-out of @ngrx/effects for entities
 */
@NgModule({
  imports: [
    StoreModule // rely on Store feature providers rather than Store.forFeature()
  ],
  providers: [
    CorrelationIdGenerator,
    DefaultDispatcherOptions,
    EntityActionFactory,
    entityCacheSelectorProvider,
    EntityCollectionCreator,
    EntityCollectionReducerFactory,
    EntityDefinitionService,
    EntityDispatcherFactory,
    EntityReducerFactory,
    EntitySelectorsFactory,
    EntitySelectors$Factory,
    {
      provide: EntityCollectionReducerMethodsFactory,
      useClass: DefaultEntityCollectionReducerMethodsFactory
    },
    { provide: ENTITY_CACHE_NAME_TOKEN, useValue: ENTITY_CACHE_NAME },
    {
      provide: ENTITY_CACHE_REDUCER,
      deps: [EntityReducerFactory],
      useFactory: createEntityReducer
    },
    {
      provide: EntityCollectionServiceFactory,
      useClass: DefaultEntityCollectionServiceFactory
    },
    {
      provide: EntityServices,
      useClass: EntityServicesBase
    },
    { provide: Logger, useClass: DefaultLogger }
  ]
})
export class NgrxDataModuleWithoutEffects implements OnDestroy {
  private entityCacheFeature: any;

  static forRoot(config: NgrxDataModuleConfig): ModuleWithProviders {
    return {
      ngModule: NgrxDataModuleWithoutEffects,
      providers: [
        {
          provide: ENTITY_CACHE_META_REDUCERS,
          useValue: config.entityCacheMetaReducers ? config.entityCacheMetaReducers : []
        },
        {
          provide: ENTITY_COLLECTION_META_REDUCERS,
          useValue: config.entityCollectionMetaReducers ? config.entityCollectionMetaReducers : []
        },
        {
          provide: PLURAL_NAMES_TOKEN,
          multi: true,
          useValue: config.pluralNames ? config.pluralNames : {}
        }
      ]
    };
  }

  constructor(
    private reducerManager: ReducerManager,
    @Inject(ENTITY_CACHE_REDUCER) private entityCacheReducer: ActionReducer<EntityCache, Action>,
    private injector: Injector,
    // optional params
    @Optional()
    @Inject(ENTITY_CACHE_NAME_TOKEN)
    private entityCacheName: string,
    @Optional()
    @Inject(INITIAL_ENTITY_CACHE_STATE)
    private initialState: any,
    @Optional()
    @Inject(ENTITY_CACHE_META_REDUCERS)
    private metaReducers: (MetaReducer<EntityCache, Action> | InjectionToken<MetaReducer<EntityCache, Action>>)[]
  ) {
    // Add the ngrx-data feature to the Store's features
    // as Store.forFeature does for StoreFeatureModule
    const key = entityCacheName || ENTITY_CACHE_NAME;

    initialState = typeof initialState === 'function' ? initialState() : initialState;

    const reducers: MetaReducer<EntityCache, Action>[] = (metaReducers || []).map(mr => {
      return mr instanceof InjectionToken ? injector.get(mr) : mr;
    });

    this.entityCacheFeature = {
      key,
      reducers: entityCacheReducer,
      reducerFactory: combineReducers,
      initialState: initialState || {},
      metaReducers: reducers
    };
    reducerManager.addFeature(this.entityCacheFeature);
  }

  ngOnDestroy() {
    this.reducerManager.removeFeature(this.entityCacheFeature);
  }
}
