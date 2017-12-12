import { NgModule, InjectionToken } from '@angular/core';
import { StoreModule, ActionReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import {
  EntityCollection,
  entityEffects,
  EntityDataServiceConfig,
  EntityFilterService,
  ENTITY_REDUCER_TOKEN,
  NgrxDataModule,
  PLURALIZER_NAMES
} from '../../ngrx-data';

import { entityFiltersProvider, NAME_OR_SAYING_FILTER } from '../core/entity-filters';

const entityDataServiceConfig: EntityDataServiceConfig = {
  api: '/api',
  getDelay: 300,
  saveDelay: 100
};

export function initialState() {
  const empty = new EntityCollection();
  return {
    Hero: empty,
    // Initialize with a custom filter for Villains
    Villain: { ...empty, filter: { name: NAME_OR_SAYING_FILTER } }
  };
}

const pluralNames = {
  // Case matters. Match the case of the class name.
  Hero: 'Heroes'
};

@NgModule({
  imports: [
    StoreModule.forFeature('entityCache', ENTITY_REDUCER_TOKEN, { initialState }),
    EffectsModule.forFeature(entityEffects),
    NgrxDataModule
  ],
  providers: [
    entityFiltersProvider,
    { provide: PLURALIZER_NAMES, useValue: pluralNames },
    { provide: EntityDataServiceConfig, useValue: entityDataServiceConfig }
  ]
})
export class EntityStoreModule {}
