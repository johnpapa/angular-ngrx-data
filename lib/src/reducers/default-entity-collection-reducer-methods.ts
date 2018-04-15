import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';

import { defaultSelectId, toUpdateFactory, IdSelector, Update } from '../utils';

import { EntityAction } from '../actions/entity-action';
import { EntityActionGuard } from '../actions/entity-action-guard';
import { EntityOp } from '../actions/entity-op';

import { EntityChangeTracker } from './entity-change-tracker';
import { EntityCollection } from './entity-collection';
import {
  EntityCollectionReducerMethods,
  EntityCollectionReducerMethodsFactory
} from './entity-collection.reducer';
import { EntityDefinition } from '../entity-metadata/entity-definition';
import { EntityDefinitionService } from '../entity-metadata/entity-definition.service';

/**
 * Creates default {EntityCollectionReducerMethods} for a given entity type.
 */
@Injectable()
export class DefaultEntityCollectionReducerMethodsFactory
  implements EntityCollectionReducerMethodsFactory {
  constructor(protected entityDefinitionService: EntityDefinitionService) {}

  /** Create the  {EntityCollectionReducerMethods} for the named entity type */
  create<T>(entityName: string): EntityCollectionReducerMethods<T> {
    const definition = this.entityDefinitionService.getDefinition<T>(
      entityName
    );
    const methodsClass = new DefaultEntityCollectionReducerMethods(
      entityName,
      definition
    );
    return methodsClass.getMethods();
  }
}

/**
 * {EntityCollectionReducerMethods} for a given entity type.
 */
export class DefaultEntityCollectionReducerMethods<T> {
  protected adapter: EntityAdapter<T>;
  protected guard: EntityActionGuard;

  /** Extract the primary key (id); default to `id` */
  selectId: IdSelector<T>;

  /**
   * Convert an entity (or partial entity) into the `Update<T>` object
   * `id`: the primary key and
   * `changes`: the entity (or partial entity of changes).
   */
  protected toUpdate: (entity: Partial<T>) => Update<T>;

  constructor(
    public entityName: string,
    public definition: EntityDefinition<T>,
    /*
     * Track changes to entities since the last query or save
     * Can revert some or all of those changes
     * Required for optimistic saves
     * TODO: consider using for all cache updates.
     */
    public entityChangeTracker?: EntityChangeTracker<T>
  ) {
    this.adapter = definition.entityAdapter;
    this.selectId = definition.selectId;

    if (!entityChangeTracker) {
      this.entityChangeTracker = new EntityChangeTracker<T>(
        entityName,
        this.adapter,
        this.selectId
      );
    }

    this.guard = new EntityActionGuard(this.selectId);
    this.toUpdate = toUpdateFactory(this.selectId);
  }

  /** get the {EntityCollectionReducerMethods} for this entity type */
  getMethods(): EntityCollectionReducerMethods<T> {
    return {
      [EntityOp.QUERY_ALL]: this.setLoadingTrue,
      [EntityOp.QUERY_ALL_ERROR]: this.setLoadingFalse,
      [EntityOp.QUERY_ALL_SUCCESS]: this.queryAllSuccess.bind(this),

      [EntityOp.QUERY_BY_KEY]: this.setLoadingTrue,
      [EntityOp.QUERY_BY_KEY_ERROR]: this.setLoadingFalse,
      [EntityOp.QUERY_BY_KEY_SUCCESS]: this.queryByKeySuccess.bind(this),

      [EntityOp.QUERY_MANY]: this.setLoadingTrue,
      [EntityOp.QUERY_MANY_ERROR]: this.setLoadingFalse,
      [EntityOp.QUERY_MANY_SUCCESS]: this.queryManySuccess.bind(this),

      [EntityOp.SAVE_ADD_ONE]: this.saveAddOne.bind(this),
      [EntityOp.SAVE_ADD_ONE_ERROR]: this.setLoadingFalse,
      [EntityOp.SAVE_ADD_ONE_SUCCESS]: this.saveAddOneSuccess.bind(this),

      [EntityOp.SAVE_ADD_ONE_OPTIMISTIC]: this.saveAddOneOptimistic.bind(this),
      [EntityOp.SAVE_ADD_ONE_OPTIMISTIC_ERROR]: this.setLoadingFalse,
      [EntityOp.SAVE_ADD_ONE_OPTIMISTIC_SUCCESS]: this.saveAddOneOptimisticSuccess.bind(
        this
      ),

      [EntityOp.SAVE_DELETE_ONE]: this.saveDeleteOne.bind(this),
      [EntityOp.SAVE_DELETE_ONE_ERROR]: this.setLoadingFalse,
      [EntityOp.SAVE_DELETE_ONE_SUCCESS]: this.saveDeleteOneSuccess.bind(this),

      [EntityOp.SAVE_DELETE_ONE_OPTIMISTIC]: this.saveDeleteOneOptimistic.bind(
        this
      ),
      [EntityOp.SAVE_DELETE_ONE_OPTIMISTIC_ERROR]: this.setLoadingFalse,
      [EntityOp.SAVE_DELETE_ONE_OPTIMISTIC_SUCCESS]: this.setLoadingFalse,

      [EntityOp.SAVE_UPDATE_ONE]: this.saveUpdateOne.bind(this),
      [EntityOp.SAVE_UPDATE_ONE_ERROR]: this.setLoadingFalse,
      [EntityOp.SAVE_UPDATE_ONE_SUCCESS]: this.saveUpdateOneSuccess.bind(this),

      [EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC]: this.saveUpdateOneOptimistic.bind(
        this
      ),
      [EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_ERROR]: this.setLoadingFalse,
      [EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_SUCCESS]: this.saveUpdateOneOptimisticSuccess.bind(
        this
      ),

      // Do nothing on save errors.
      // See the ChangeTrackerMetaReducers
      // Or the app could listen for those errors and do something

      /// cache only operations ///

      [EntityOp.ADD_ALL]: this.addAll.bind(this),
      [EntityOp.ADD_MANY]: this.addMany.bind(this),
      [EntityOp.ADD_ONE]: this.addOne.bind(this),

      [EntityOp.REMOVE_ALL]: this.removeAll.bind(this),
      [EntityOp.REMOVE_MANY]: this.removeMany.bind(this),
      [EntityOp.REMOVE_ONE]: this.removeOne.bind(this),

      [EntityOp.UPDATE_MANY]: this.updateMany.bind(this),
      [EntityOp.UPDATE_ONE]: this.updateOne.bind(this),

      [EntityOp.UPSERT_MANY]: this.upsertMany.bind(this),
      [EntityOp.UPSERT_ONE]: this.upsertOne.bind(this),

      [EntityOp.SET_FILTER]: this.setFilter.bind(this),
      [EntityOp.SET_LOADED]: this.setLoaded.bind(this),
      [EntityOp.SET_LOADING]: this.setLoading.bind(this)
    };
  }

  protected queryAllSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<T[]>
  ): EntityCollection<T> {
    return {
      ...this.adapter.addAll(action.payload, collection),
      loaded: true, // Only QUERY_ALL_SUCCESS sets loaded to true
      loading: false,
      originalValues: {}
    };
  }

  protected queryByKeySuccess(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    const upsert = action.payload && this.toUpdate(action.payload);
    return upsert == null
      ? collection.loading ? { ...collection, loading: false } : collection
      : {
          ...this.adapter.upsertOne(upsert, collection),
          loading: false
        };
  }

  protected queryManySuccess(
    collection: EntityCollection<T>,
    action: EntityAction<T[]>
  ): EntityCollection<T> {
    const upserts = (action.payload as T[]).map(this.toUpdate);
    return {
      ...this.adapter.upsertMany(upserts, collection),
      loading: false
    };
  }

  /** pessimistic add; add entity only upon success
   * It may be OK that the pkey is missing because the server may generate the ID
   * If it doesn't, the reducer will catch the error in the success action
   */
  protected saveAddOne(collection: EntityCollection<T>): EntityCollection<T> {
    return collection;
  }

  /** pessimistic add upon success */
  protected saveAddOneSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ) {
    // Ensure the server generated the primary key if the client didn't send one.
    this.guard.mustBeEntity(action);
    return this.adapter.addOne(action.payload, collection);
  }

  /** optimistic add; add entity immediately
   * Must have pkey to add optimistically
   */
  protected saveAddOneOptimistic(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    // Ensure the server generated the primary key if the client didn't send one.
    this.guard.mustBeEntity(action);
    return this.adapter.addOne(action.payload, collection);
  }

  // Although already added to collection
  // the server might have added other fields (e.g, concurrency field)
  // Therefore, update with returned value
  // Caution: in a race, this update could overwrite unsaved user changes.
  // Use pessimistic add to avoid this risk.
  /** optimistic add succeeded. */
  protected saveAddOneOptimisticSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    this.guard.mustBeEntity(action);
    const update = this.toUpdate(action.payload);
    return this.adapter.updateOne(update, collection);
  }

  /** pessimistic delete by entity key */
  protected saveDeleteOne(
    collection: EntityCollection<T>
  ): EntityCollection<T> {
    return collection;
  }

  /** pessimistic delete, after success */
  protected saveDeleteOneSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<number | string>
  ): EntityCollection<T> {
    // payload assumed to be entity key
    return this.adapter.removeOne(action.payload as string, collection);
  }

  /** optimistic delete by entity key immediately */
  protected saveDeleteOneOptimistic(
    collection: EntityCollection<T>,
    action: EntityAction<number | string>
  ): EntityCollection<T> {
    // payload assumed to be entity key
    return this.adapter.removeOne(action.payload as string, collection);
  }

  /**
   * pessimistic update; update entity only upon success
   * payload must be an {Update<T>}
   */
  protected saveUpdateOne(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>>
  ): EntityCollection<T> {
    this.guard.mustBeUpdate(action);
    return collection;
  }

  /** pessimistic update upon success */
  protected saveUpdateOneSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>>
  ): EntityCollection<T> {
    return this.adapter.upsertOne(action.payload, collection);
  }

  /**
   * optimistic update; update entity immediately
   * payload must be an {Update<T>}
   */
  protected saveUpdateOneOptimistic(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>>
  ): EntityCollection<T> {
    this.guard.mustBeUpdate(action);
    return this.adapter.upsertOne(action.payload, collection);
  }

  /** optimistic update; collection already updated.
   * Server may have touched other fields
   * so update the collection again if the server sent different data.
   * payload must be an {Update<T>}
   */
  protected saveUpdateOneOptimisticSuccess(
    collection: EntityCollection<T>,
    action: EntityAction
  ): EntityCollection<T> {
    const result = action.payload || { unchanged: true };
    // A data service like `DefaultDataService<T>` will add `unchanged:true`
    // if the server responded without data, meaning there is nothing to update.
    return result.unchanged
      ? collection
      : this.adapter.upsertOne(action.payload, collection);
  }

  ///// Cache-only operations /////

  protected addAll(
    collection: EntityCollection<T>,
    action: EntityAction<T[]>
  ): EntityCollection<T> {
    this.guard.mustBeEntities(action);
    return this.adapter.addAll(action.payload, collection);
  }

  protected addMany(
    collection: EntityCollection<T>,
    action: EntityAction<T[]>
  ): EntityCollection<T> {
    this.guard.mustBeEntities(action);
    return this.adapter.addMany(action.payload, collection);
  }

  protected addOne(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    this.guard.mustBeEntity(action);
    return this.adapter.addOne(action.payload, collection);
  }

  protected removeAll(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    return {
      ...this.adapter.removeAll(collection),
      loaded: false, // Only REMOVE_ALL sets loaded to false
      loading: false,
      originalValues: {}
    };
  }

  protected removeMany(
    collection: EntityCollection<T>,
    action: EntityAction<number[] | string[]>
  ): EntityCollection<T> {
    // payload must be entity keys
    return this.adapter.removeMany(action.payload as string[], collection);
  }

  protected removeOne(
    collection: EntityCollection<T>,
    action: EntityAction<number | string>
  ): EntityCollection<T> {
    // payload must be entity key
    return this.adapter.removeOne(action.payload as string, collection);
  }

  protected updateMany(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>[]>
  ): EntityCollection<T> {
    // payload must be an array of `Updates<T>`, not entities
    this.guard.mustBeUpdates(action);
    return this.adapter.updateMany(action.payload, collection);
  }

  protected updateOne(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>>
  ): EntityCollection<T> {
    // payload must be an `Update<T>`, not an entity
    this.guard.mustBeUpdate(action);
    return this.adapter.updateOne(action.payload, collection);
  }

  protected upsertMany(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>[]>
  ): EntityCollection<T> {
    // <v6: payload must be an array of `Updates<T>`, not entities
    // v6+: payload must be a T
    this.guard.mustBeUpdates(action);
    return this.adapter.upsertMany(action.payload, collection);
  }

  protected upsertOne(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>>
  ): EntityCollection<T> {
    // <v6: payload must be an `Update<T>`, not an entity
    // v6+: payload must be a T
    this.guard.mustBeUpdate(action);
    return this.adapter.upsertOne(action.payload, collection);
  }

  protected setFilter(
    collection: EntityCollection<T>,
    action: EntityAction
  ): EntityCollection<T> {
    const filter = action.payload;
    return collection.filter === filter
      ? collection
      : { ...collection, filter };
  }

  protected setLoaded(
    collection: EntityCollection<T>,
    action: EntityAction<boolean>
  ): EntityCollection<T> {
    const loaded = action.payload === true || false;
    return collection.loaded === loaded
      ? collection
      : { ...collection, loaded };
  }

  protected setLoading(
    collection: EntityCollection<T>,
    action: EntityAction<boolean>
  ): EntityCollection<T> {
    const loading = action.payload === true || false;
    return collection.loading === loading
      ? collection
      : { ...collection, loading };
  }

  protected setLoadingFalse(
    collection: EntityCollection<T>
  ): EntityCollection<T> {
    return collection.loading ? { ...collection, loading: false } : collection;
  }

  protected setLoadingTrue(
    collection: EntityCollection<T>
  ): EntityCollection<T> {
    return collection.loading ? collection : { ...collection, loading: true };
  }
}
