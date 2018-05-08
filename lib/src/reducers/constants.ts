import { InjectionToken } from '@angular/core';
import { Action, ActionReducer, MetaReducer } from '@ngrx/store';
import { EntityCache } from './entity-cache';

export const ENTITY_CACHE_NAME = 'entityCache';
export const ENTITY_CACHE_NAME_TOKEN = new InjectionToken<string>(
  'ngrx-data/Entity Cache Name'
);

export const ENTITY_CACHE_META_REDUCERS = new InjectionToken<
  MetaReducer<any, any>[]
>('ngrx-data/Entity Cache MetaReducers');
export const ENTITY_COLLECTION_META_REDUCERS = new InjectionToken<
  MetaReducer<any, any>[]
>('ngrx-data/Entity Collection MetaReducers');
export const ENTITY_CACHE_REDUCER = new InjectionToken<
  ActionReducer<EntityCache>
>('ngrx-data/Entity Reducer');

export const INITIAL_ENTITY_CACHE_STATE = new InjectionToken<
  EntityCache | (() => EntityCache)
>('ngrx-data/Initial Entity Cache State');
