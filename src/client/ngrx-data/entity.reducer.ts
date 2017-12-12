import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { EntityAction, EntityOp } from './entity.actions';
import { EntityCache, EntityCollection } from './interfaces';
import { EntityFilterService, EntityFilter } from './entity-filter.service';

@Injectable()
export class EntityReducer {
  constructor(private filterService: EntityFilterService) {}
  getReducer() {
    return entityReducerFactory(this.filterService);
  }
}

export function entityReducerFactory(filterService: EntityFilterService) {
  return function entityReducer(
    state: EntityCache = {},
    action: EntityAction<any, any>
  ): EntityCache {
    const entityName = action.entityName;
    if (!entityName) {
      return state; // not an EntityAction
    }

    const collection = state[entityName];
    // TODO: consider creating a collection if none exists.
    //       Worried now that later implementation would depend upon
    //       missing collection metadata.
    if (!collection) {
      throw new Error(`No cached collection named "${entityName}")`);
    }

    // Todo: intercept and redirect if there's a custom entityCollectionReducerFactory
    const newCollection = entityCollectionReducerFactory(filterService)(collection, action);

    return collection === newCollection ? state : { ...state, ...{ [entityName]: newCollection } };
  };
}

export function entityCollectionReducerFactory<T>(filterService: EntityFilterService) {
  return function entityCollectionReducer(
    collection: EntityCollection<T>,
    action: EntityAction<T, any>
  ): EntityCollection<T> {
    switch (action.op) {
      case EntityOp.ADD_SUCCESS: {
        // pessimistic add; add entity only upon success
        return {
          ...collection,
          entities: [...collection.entities, { ...action.payload }]
        };
      }

      case EntityOp.GET_ALL_SUCCESS: {
        return {
          ...collection,
          entities: action.payload
        };
      }

      case EntityOp._DELETE_BY_INDEX: {
        // optimistic deletion
        const ix: number = action.payload.index;
        return ix == null || ix < 0
          ? collection
          : {
              ...collection,
              entities: collection.entities.slice(0, ix).concat(collection.entities.slice(ix + 1))
            };
      }

      case EntityOp._DELETE_ERROR: {
        // When delete-to-server fails
        // restore deleted entity to list (if it was known to be in the list)
        const payload = action.payload.originalAction.payload;
        const ix: number = payload.index;
        return ix == null || ix < 0 || !payload.entity
          ? collection
          : {
              ...collection,
              entities: collection.entities
                .slice(0, ix)
                .concat(payload.entity, collection.entities.slice(ix + 1))
            };
      }

      case EntityOp.UPDATE_SUCCESS: {
        // pessimistic update; update entity only upon success
        return {
          ...collection,
          entities: collection.entities.map((entity: any) => {
            return entity.id === action.payload.id
              ? { ...entity, ...action.payload } // merge changes
              : entity;
          })
        };
      }

      // Filter getting and setting is tricky because both the existing filter and
      // incoming payload value could be either a string or an EntityFilter.
      // The following two reducer actions accept all four possibilities.
      // SET_FILTER upgrades the filter to an EntityFilter if the pattern is an EntityFilter.

      case EntityOp.GET_FILTERED: {
        let filteredEntities: T[];
        const filter = collection.filter;
        if (filter) {
          const { name = '', pattern } = typeof filter === 'string' ? { pattern: filter } : filter;
          const filterFn = filterService.getFilterFn<T>(name, action.entityName);
          filteredEntities = filterFn(collection.entities, pattern);
        } else {
          filteredEntities = collection.entities;
        }
        return { ...collection, filteredEntities };
      }

      case EntityOp.SET_FILTER: {
        const filter = { ...collection.filter, ...action.payload };
        return { ...collection, filter };
      }

      case EntityOp.SET_FILTER_PATTERN: {
        const filter = { ...collection.filter, pattern: action.payload };
        return { ...collection, filter };
      }

      case EntityOp.SET_LOADING: {
        return { ...collection, loading: action.payload };
      }

      default: {
        return collection;
      }
    }
  };
}
