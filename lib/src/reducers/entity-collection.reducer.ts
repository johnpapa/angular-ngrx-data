import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';

import { defaultSelectId, IdSelector, toUpdateFactory, Update } from '../utils';
import { EntityAction } from '../actions/entity-action';
import { EntityActionGuard } from '../actions/entity-action-guard';
import { EntityOp } from '../actions/entity-op';

import { EntityChangeTracker } from './entity-change-tracker';
import { EntityCollection } from './entity-collection';

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
    selectId = selectId || defaultSelectId;

    /**
     * Convert an entity (or partial entity) into the `Update<T>` object
     * `id`: the primary key and
     * `changes`: the entity (or partial entity of changes).
     */
    const toUpdate = toUpdateFactory(selectId);

    /*
     * Track changes to entities since the last query or save
     * Can revert some or all of those changes
     * Required for optimistic saves
     * TODO: consider using for all cache updates.
     */
    const entityChangeTracker = new EntityChangeTracker<T>(
      entityName, adapter, selectId);

    const guard = new EntityActionGuard(entityName, selectId);

    /** Perform Actions against a particular entity collection in the EntityCache */
    return function entityCollectionReducer(
      collection: EntityCollection<T>,
      action: EntityAction
    ): EntityCollection<T> {
      switch (action.op) {

        // Only the query ops set loading flag.
        // Assume query results always come from server and do not need to be guarded.
        case EntityOp.QUERY_ALL:
        case EntityOp.QUERY_BY_KEY:
        case EntityOp.QUERY_MANY: {
          return collection.loading ? collection : { ...collection, loading: true };
        }

        case EntityOp.QUERY_ALL_SUCCESS: {
          return {
            ...adapter.addAll(action.payload, collection),
            loaded: true, // Only QUERY_ALL_SUCCESS sets loaded to true
            loading: false,
            originalValues: {}
          };
        }

        case EntityOp.QUERY_BY_KEY_SUCCESS: {
          const upsert = action.payload && toUpdate(action.payload);
          return upsert == null ?
            collection.loading ? { ...collection, loading: false } : collection :
            {
              ...adapter.upsertOne(upsert, collection),
              loading: false
            };
        }

        case EntityOp.QUERY_MANY_SUCCESS: {
          const upserts = (action.payload as T[]).map(toUpdate);
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

        // Do nothing on save errors.
        // See the ChangeTrackerMetaReducers
        // Or the app could listen for those errors and do something.

        // pessimistic add; add entity only upon success
        // It may be OK that the pkey is missing because the server may generate the ID
        // If it doesn't, the reducer will catch the error in the success action
        case EntityOp.SAVE_ADD_ONE: {
          return collection;
        }

        // pessimistic add upon success
        case EntityOp.SAVE_ADD_ONE_SUCCESS: {
          // Ensure the server generated the primary key if the client didn't send one.
          guard.mustBeEntities([action.payload], action.op, true);
          return adapter.addOne(action.payload, collection);
        }

        // optimistic add; add entity immediately
        // Must have pkey to add optimistically
        case EntityOp.SAVE_ADD_ONE_OPTIMISTIC: {
          guard.mustBeEntities([action.payload], action.op, true);
          return adapter.addOne(action.payload, collection);
        }

        // optimistic add succeeded.
        // Although already added to collection
        // the server might have added other fields (e.g, concurrency field)
        // Therefore, update with returned value
        // Caution: in a race, this update could overwrite unsaved user changes.
        // Use pessimistic add to avoid this risk.
        case EntityOp.SAVE_ADD_ONE_OPTIMISTIC_SUCCESS: {
          guard.mustBeEntities([action.payload], action.op, true);
          const update = toUpdate(action.payload);
          return adapter.updateOne(update, collection);
        }

        // pessimistic delete by entity key
        case EntityOp.SAVE_DELETE_ONE: {
          guard.mustBeIds([action.payload], action.op, true);
          return collection;
        }

        // pessimistic delete, after success
        case EntityOp.SAVE_DELETE_ONE_SUCCESS: {
          // payload assumed to be entity key
          return adapter.removeOne(action.payload, collection);
        }

        // optimistic delete by entity key immediately
        case EntityOp.SAVE_DELETE_ONE_OPTIMISTIC: {
          guard.mustBeIds([action.payload], action.op, true);
          return adapter.removeOne(action.payload, collection);
        }

        // pessimistic update; update entity only upon success
        // payload must be an `Update<T>`
        case EntityOp.SAVE_UPDATE_ONE: {
          guard.mustBeUpdates([action.payload], action.op, true);
          return collection;
        }

        // pessimistic update upon success
        case EntityOp.SAVE_UPDATE_ONE_SUCCESS: {
          return adapter.upsertOne(action.payload, collection);
        }

        // optimistic update; update entity immediately
        // payload must be an` Update<T>`
        case EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC: {
          guard.mustBeUpdates([action.payload], action.op, true);
          return adapter.upsertOne(action.payload, collection);
        }

        // optimistic update; collection already updated.
        // Server may have touched other fields
        // so update the collection again if the server sent different data.
        // payload must be an` Update<T>`
        case EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_SUCCESS: {
          const result = action.payload || {};
          // A data service like `DefaultDataService<T>` will add `unchanged:true`
          // if the server responded without data, meaning there is nothing to update.
          return (result.unchanged) ?
            collection :
            adapter.upsertOne(action.payload, collection);
        }

        ///// Cache-only operations /////

        case EntityOp.ADD_ALL: {
          guard.mustBeEntities(action.payload, action.op);
          return adapter.addAll(action.payload, collection);
        }

        case EntityOp.ADD_MANY: {
          guard.mustBeEntities(action.payload, action.op);
          return adapter.addMany(action.payload, collection);
        }

        case EntityOp.ADD_ONE: {
          guard.mustBeEntities([action.payload], action.op, true);
          return adapter.addOne(action.payload, collection);
        }

        case EntityOp.REMOVE_ALL: {
          return {
            ...adapter.removeAll(collection),
            loaded: false, // Only REMOVE_ALL sets loaded to false
            loading: false,
            originalValues: {}
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
          guard.mustBeUpdates(action.payload, action.op);
          return adapter.updateMany(action.payload, collection);
        }

        case EntityOp.UPDATE_ONE: {
          // payload must be an `Update<T>`, not an entity
          guard.mustBeUpdates([action.payload], action.op, true);
          return adapter.updateOne(action.payload, collection);
        }

        case EntityOp.UPSERT_MANY: {
          // payload must be an array of `Updates<T>`, not entities
          guard.mustBeUpdates(action.payload, action.op);
          return adapter.upsertMany(action.payload, collection);
        }

        case EntityOp.UPSERT_ONE: {
          // payload must be an `Update<T>`, not an entity
          guard.mustBeUpdates([action.payload], action.op, true);
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
