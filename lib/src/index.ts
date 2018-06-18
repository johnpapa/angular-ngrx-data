// AOT v5 bug:
// NO BARRELS or else `ng build --aot` of any app using ngrx-data produces strange errors
// actions
export * from './actions/entity-action';
export * from './actions/entity-action-factory';
export * from './actions/entity-action-guard';
export * from './actions/entity-action-operators';
export * from './actions/entity-cache-action';
export * from './actions/entity-op';
export * from './actions/merge-strategy';

// dataservices
export * from './dataservices/data-service-error';
export * from './dataservices/default-data.service';
export * from './dataservices/entity-data.service';
export * from './dataservices/http-url-generator';
export * from './dataservices/interfaces';
export * from './dataservices/persistence-result-handler.service';

// dispatchers
export * from './dispatchers/default-dispatcher-options';
export * from './dispatchers/entity-commands';
export * from './dispatchers/entity-dispatcher';
export * from './dispatchers/entity-dispatcher-base';
export * from './dispatchers/entity-dispatcher-factory';

// effects
export * from './effects/entity-effects';

// entity-metadata
export * from './entity-metadata/entity-definition';
export * from './entity-metadata/entity-definition.service';
export * from './entity-metadata/entity-filters';
export * from './entity-metadata/entity-metadata';

// entity-services
export * from './entity-services/default-entity-collection-service-factory';
export * from './entity-services/entity-services-interfaces';
export * from './entity-services/entity-collection-service-base';
export * from './entity-services/entity-services-base';

// reducers
export * from './reducers/constants';
export * from './reducers/default-entity-change-tracker';
export * from './reducers/default-entity-collection-reducer-methods';
export * from './reducers/entity-cache';
export * from './reducers/entity-change-tracker';
export * from './reducers/entity-collection';
export * from './reducers/entity-collection-reducer';
export * from './reducers/entity-collection-creator';
export * from './reducers/entity-reducer';

// selectors
export * from './selectors/entity-selectors';
export * from './selectors/entity-selectors$';
export * from './selectors/entity-cache-selector';

// Utils
export * from './utils/correlation-id-generator';
export * from './utils/default-logger';
export * from './utils/default-pluralizer';
export * from './utils/guid-fns';
export * from './utils/interfaces';
export * from './utils/ngrx-entity-models'; // should be exported by @ngrx/entity
export * from './utils/utilities';

// NgrxDataModule
export { NgrxDataModule } from './ngrx-data.module';
export { NgrxDataModuleWithoutEffects, NgrxDataModuleConfig } from './ngrx-data-without-effects.module';
