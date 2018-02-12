import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';
import { IdSelector, Update } from './ngrx-entity-models';

import { EntityAction, EntityOp } from './entity.actions';
import { EntityCollection } from './entity-definition';

export type EntityCollectionReducer<T> = (
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
    selectId = selectId || ((entity: any) => entity.id);

    /** Perform Actions against a particular entity collection in the EntityCache */
    return function entityCollectionReducer(
      collection: EntityCollection<T>,
      action: EntityAction
    ): EntityCollection<T> {
      switch (action.op) {
        // Only the QUERY_ALL and QUERY_MANY methods set loading flag.
        case EntityOp.QUERY_ALL:
        case EntityOp.QUERY_MANY: {
          return collection.loading ? collection : { ...collection, loading: true };
        }

        case EntityOp.QUERY_ALL_SUCCESS: {
          return {
            ...adapter.addAll(action.payload, collection),
            loaded: true,
            loading: false
          };
        }

        case EntityOp.QUERY_MANY_SUCCESS: {
          // Todo: use "upsert" instead  when it becomes available.
          const updates: Update<T>[] = [];
          const adds: T[] = [];
          action.payload.forEach((item: T) => {
            const id = selectId(item);
            if (collection.entities[id]) {
              updates.push({id, changes: item} as Update<T>);
            } else {
              adds.push(item);
            }
          });
          const addCollection = adapter.addMany(adds, collection);
          const updateCollection = adapter.updateMany(updates, addCollection);
          return {
            ...updateCollection,
            loading: false
          };
        }

        case EntityOp.QUERY_ALL_ERROR:
        case EntityOp.QUERY_MANY_ERROR: {
          return collection.loading ? { ...collection, loading: false } : collection;
        }

        // Do nothing on other save errors.
        // The app should listen for those and do something.

        case EntityOp.QUERY_BY_KEY_SUCCESS: {
          // Todo: use "upsert" instead when it becomes available.
          const id = selectId(action.payload);
          if (collection.entities[id]) {
            const update = {id, changes: action.payload} as Update<T>;
            return adapter.updateOne(update, collection)
          } else {
            return adapter.addOne(action.payload, collection)
          }
        }

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
            loaded: false,
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
