import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';
import { IdSelector, Update } from './ngrx-entity-models';

import { EntityAction, EntityOp } from './entity.actions';
import { EntityCollection } from './entity-definition';
import { toUpdateFactory } from './utils';

export type EntityCollectionReducer<T = any> = (
  collection: EntityCollection<T>,
  action: EntityAction
) => EntityCollection<T>;

/** Create a default reducer for a specific entity collection */
@Injectable()
export class EntityCollectionReducerFactory {

  /** Create a default reducer for a collection of entities of T */
  create<T = any>(
    entityName: string,
    adapter: EntityAdapter<T>,
    selectId?: IdSelector<T>
  ): EntityCollectionReducer<T> {

    /** Extract the primary key (id); default to `id` */
    selectId = selectId || ((entity: any) => entity.id);

    /**
     * Convert an entity (or partial entity) into the `Update<T>` object
     * `id`: the primary key and
     * `changes`: the entity (or partial entity of changes).
     */
    const toUpdate = toUpdateFactory(selectId);

    /** Perform Actions against a particular entity collection in the EntityCache */
    return function entityCollectionReducer(
      collection: EntityCollection<T>,
      action: EntityAction
    ): EntityCollection<T> {
      switch (action.op) {
        // Only the query ops set loading flag.
        case EntityOp.QUERY_ALL:
        case EntityOp.QUERY_BY_KEY:
        case EntityOp.QUERY_MANY: {
          return collection.loading ? collection : { ...collection, loading: true };
        }

        case EntityOp.QUERY_ALL_SUCCESS: {
          return {
            ...adapter.addAll(action.payload, collection),
            loaded: true, // Only QUERY_ALL_SUCCESS sets loaded to true
            loading: false
          };
        }

        case EntityOp.QUERY_BY_KEY_SUCCESS: {
          const upsert = toUpdate(action.payload);
          return upsert ?
            {
              ...adapter.upsertOne(upsert, collection),
              loading: false
            } :
            collection.loading ? { ...collection, loading: false } : collection;
        }

        case EntityOp.QUERY_MANY_SUCCESS: {
          const upserts = (action.payload as T[] || []).map(toUpdate);
          return {
            ...adapter.upsertMany(upserts, collection),
            loading: false
          }
        }

        case EntityOp.QUERY_ALL_ERROR:
        case EntityOp.QUERY_BY_KEY_ERROR:
        case EntityOp.QUERY_MANY_ERROR: {
          return collection.loading ? { ...collection, loading: false } : collection;
        }

        // Do nothing on other save errors.
        // The app should listen for those and do something.

        // pessimistic add; add entity only upon success
        case EntityOp.SAVE_ADD_SUCCESS: {
          return adapter.addOne(action.payload, collection);
        }

        // optimistic delete
        case EntityOp.SAVE_DELETE: {
          // payload assumed to be entity key
          return adapter.removeOne(action.payload, collection);
        }

        // pessimistic update; update entity only upon success
        // payload must be an` Update<T>` which is
        // `id`: the primary key and
        // `changes`: the complete entity or a partial entity of changes.
        case EntityOp.SAVE_UPDATE_SUCCESS: {
          return adapter.updateOne(action.payload, collection);
        }

        // Cache-only operations

        case EntityOp.ADD_ALL: {
          return adapter.addAll(action.payload, collection);
        }

        case EntityOp.ADD_MANY: {
          return adapter.addMany(action.payload, collection);
        }

        case EntityOp.ADD_ONE: {
          return adapter.addOne(action.payload, collection);
        }

        case EntityOp.REMOVE_ALL: {
          return {
            ...adapter.removeAll(collection),
            loaded: false, // Only REMOVE_ALL sets loaded to false
            loading: false
          };
        }

        case EntityOp.REMOVE_MANY: {
          // payload must be entity keys
          return adapter.removeMany(action.payload, collection);
        }

        case EntityOp.REMOVE_ONE: {
          // payload must be entity key
          return adapter.removeOne(action.payload, collection);
        }

        case EntityOp.UPDATE_MANY: {
          // payload must be an array of `Updates<T>`, not entities
          return adapter.updateMany(action.payload, collection);
        }

        case EntityOp.UPDATE_ONE: {
          // payload must be an `Update<T>`, not an entity
          return adapter.updateOne(action.payload, collection);
        }

        case EntityOp.UPSERT_MANY: {
          // payload must be an array of `Updates<T>`, not entities
          return adapter.upsertMany(action.payload, collection);
        }

        case EntityOp.UPSERT_ONE: {
          // payload must be an `Update<T>`, not an entity
          return adapter.upsertOne(action.payload, collection);
        }

        case EntityOp.SET_FILTER: {
          return { ...collection, filter: action.payload };
        }

        default: {
          return collection;
        }
      }
    };
  }
}
