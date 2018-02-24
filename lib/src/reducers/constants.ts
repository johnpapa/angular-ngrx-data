import { InjectionToken } from '@angular/core';
import { Action, ActionReducer } from '@ngrx/store';
import { EntityCache } from './entity-cache';

export const ENTITY_CACHE_NAME = 'entityCache';
export const ENTITY_CACHE_NAME_TOKEN = new InjectionToken<string>('ngrx-data/Entity Cache Name');

export const ENTITY_COLLECTION_META_REDUCERS = new InjectionToken('ngrx-data/Entity Collection MetaReducers');
export const ENTITY_REDUCER_TOKEN = new InjectionToken<ActionReducer<EntityCache>>(
  'ngrx-data/Entity Reducer'
);
