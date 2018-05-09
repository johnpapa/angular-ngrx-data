import {
  ModuleWithProviders,
  NgModule,
  Inject,
  Injector,
  InjectionToken,
  Optional,
  OnDestroy
} from '@angular/core';
import {
  Action,
  ActionReducer,
  combineReducers,
  MetaReducer,
  ReducerManager,
  StoreModule
} from '@ngrx/store';
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

import { EntityCache } from './reducers/entity-cache';
import { entityCacheSelectorProvider } from './selectors/entity-cache-selector';
import { EntityCollectionServiceFactory } from './entity-services/entity-services-interfaces';
import { DefaultEntityCollectionServiceFactory } from './entity-services/default-entity-collection-service-factory';
import { EntityCollection } from './reducers/entity-collection';
import { EntityCollectionCreator } from './reducers/entity-collection-creator';
import {
  EntityCollectionReducerFactory,
  EntityCollectionReducerMethodsFactory
} from './reducers/entity-collection-reducer';
import { EntityEffects } from './effects/entity-effects';

import { DefaultEntityCollectionReducerMethodsFactory } from './reducers/default-entity-collection-reducer-methods';
import {
  createEntityReducer,
  EntityReducerFactory
} from './reducers/entity-reducer';
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
  entityCacheMetaReducers?: (
    | MetaReducer<EntityCache, Action>
    | InjectionToken<MetaReducer<EntityCache, Action>>)[];
  entityCollectionMetaReducers?: MetaReducer<EntityCollection, EntityAction>[];
  // Initial EntityCache state or a function that returns that state
  initialEntityCacheState?: EntityCache | (() => EntityCache);
  pluralNames?: { [name: string]: string };
}

/**
 * Module without effects which means no HTTP calls
 * It is helpful for internal testing but not for users
 */
@NgModule({
  imports: [
    StoreModule // rely on Store feature providers rather than Store.forFeature()
  ],
  providers: [
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
// tslint:disable-next-line:class-name
export class _NgrxDataModuleWithoutEffects implements OnDestroy {
  private entityCacheFeature: any;

  constructor(
    private reducerManager: ReducerManager,
    @Inject(ENTITY_CACHE_REDUCER)
    private entityCacheReducer: ActionReducer<EntityCache, Action>,
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
    private metaReducers: (
      | MetaReducer<EntityCache, Action>
      | InjectionToken<MetaReducer<EntityCache, Action>>)[]
  ) {
    // Add the ngrx-data feature to the Store's features
    // as Store.forFeature does for StoreFeatureModule
    const key = entityCacheName || ENTITY_CACHE_NAME;

    initialState =
      typeof initialState === 'function' ? initialState() : initialState;

    const reducers: MetaReducer<EntityCache, Action>[] = (
      metaReducers || []
    ).map(mr => {
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

/**
 * Ngrx-data main module
 * Configure with `forRoot`.
 * No `forFeature` yet.
 */
@NgModule({
  imports: [
    _NgrxDataModuleWithoutEffects,
    EffectsModule // do not supply effects because can't replace later
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
          provide: ENTITY_CACHE_META_REDUCERS,
          useValue: config.entityCacheMetaReducers
            ? config.entityCacheMetaReducers
            : []
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
          useValue: config.pluralNames ? config.pluralNames : {}
        }
      ]
    };
  }

  constructor(
    private effectSources: EffectSources,
    entityEffects: EntityEffects
  ) {
    // We can't use `forFeature()` because, if we did, the developer could not
    // replace the ngrx-data `EntityEffects` with a custom alternative.
    // Replacing that class is an extensibility point we need.
    //
    // The FEATURE_EFFECTS token is not exposed, so can't use that technique.
    // Warning: this alternative approach relies on an undocumented API
    // to add effect directly rather than through `forFeature()`.
    // The danger is that EffectsModule.forFeature evolves and we no longer perform a crucial step.
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
