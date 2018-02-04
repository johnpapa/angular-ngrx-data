import { Inject, Injectable } from '@angular/core';
import { createFeatureSelector, Selector, Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { filter, share, takeUntil, tap } from 'rxjs/operators';

import { EntityAction, EntityActions } from './entity.actions';
import { Dictionary } from './ngrx-entity-models';

import { EntityCache, ENTITY_CACHE_NAME_TOKEN, CREATE_ENTITY_DISPATCHER_TOKEN, QueryParams } from './interfaces';
import { EntityDefinitionService } from './entity-definition.service';
import { EntityDispatcher, createEntityDispatcher } from './entity-dispatcher';
import { createEntitySelectors$, EntitySelectors$ } from './entity.selectors';

// tslint:disable:member-ordering
export interface EntityService<T> {
  /*** COMMANDS ***/

  /**
   * Save a new entity to remote storage.
   * Does not add to cache until save succeeds.
   * Ignored by cache-add if the entity is already in cache.
   */
  add(entity: T): void;

  /**
   * Removes entity from the cache by key (if it is in the cache).
   * and deletes entity from remote storage by key.
   * Does not restore to cache if the delete fails.
   */  delete(key: string | number): void;

  /**
   * Query remote storage for all entities and
   * completely replace the cached collection with the queried entities.
   */
  getAll(): void;

  /**
   * Query remote storage for the entity with this primary key.
   * If the server returns an entity,
   * merge it into the cached collection.
   */
  getByKey(key: any): void;

  /**
   * Query remote storage for the entities that satisfy a query expressed
   * with either a query parameter map or an HTTP URL query string.
   * and merge the results into the cached collection.
   */
  getWithQuery(queryParams: QueryParams | string): void

  /**
   * Save the updated entity (or partial entity) to remote storage.
   * Updates the cached entity after the save succeeds.
   * Update in cache is ignored if the entity's key is not found in cache.
   * The update entity may be partial (but must have its key)
   * in which case it patches the existing entity.
   */
  update(entity: Partial<T>): void;

  /*** Cache-only operations that do not update remote storage ***/
  /**
   * Replace all entities in the cached collection.
   * Does not save to remote storage.
   */
  addAllToCache(entities: T[]): void;

  /**
   * Add a new entity directly to the cache.
   * Does not save to remote storage.
   * Ignored if an entity with the same primary key is already in cache.
   */
  addOneToCache(entity: T): void;

  /**
   * Add multiple new entities directly to the cache.
   * Does not save to remote storage.
   * Entities with primary keys already in cache are ignored.
   */
  addManyToCache(entities: T[]): void;

  /** Clear the cached entity collection */
  clear(): void;

  /**
   * Remove an entity directly from the cache.
   * Does not delete that entity from remote storage.
   */
  removeOneFromCache(key: string | number): void;

  /**
   * Remove multiple entities directly from the cache.
   * Does not delete these entities from remote storage.
   */
  removeManyFromCache(keys: string[] | number[]): void;

  /**
   * Update a cached entity directly.
   * Does not update that entity in remote storage.
   * Ignored if an entity with matching primary key is not in cache.
   * The update entity may be partial (but must have its key)
   * in which case it patches the existing entity.
   */
  updateOneInCache(entity: Partial<T>): void;

  /**
   * Update multiple cached entities directly.
   * Does not update these entities in remote storage.
   * Entities whose primary keys are not in cache are ignored.
   * Update entities may be partial (but each must have its key);
   * such partial entities patch their cached counterparts.
   */
  updateManyInCache(entities: Partial<T>[]): void;

  /**
   * Set the pattern that the collection's filter applies
   * when using the `filteredEntities` selector.
   */
  setFilter(pattern: any): void;

  /*** QUERIES ***/

  /** Observable of actions related to this entity type. */
  actions$: EntityActions;
  /** Observable of count of entities in the cached collection. */
  count$: Observable<number> | Store<number>;
  /** Observable of all entities in the cached collection. */
  entities$: Observable<T[]> | Store<T[]>;
  /** Observable of the map of entity keys to entities */
  entityKeyMap$: Observable<Dictionary<T>> | Store<Dictionary<T>>;
  /** Observable of the filter pattern applied by the entity collection's filter function */
  filter$: Observable<string> | Store<string>;
  /** Observable of entities in the cached collection that pass the filter function */
  filteredEntities$: Observable<T[]> | Store<T[]>;
  /** Observable of the keys of the cached collection, in the collection's native sort order */
  keys$: Observable<string[] | number[]> | Store<string[] | number[]>;
  /** Boolean Observable, true when a query command that is loading the collection is in progress. */
  loading$: Observable<boolean> | Store<boolean>;
}
// tslint:enable:member-ordering
/////////////////

@Injectable()
export class EntityServiceFactory {
  private createDispatcher: typeof createEntityDispatcher;
  private cacheSelector: Selector<Object, EntityCache>;
  private selectors$Map: { [entityName: string]: EntitySelectors$<any> } = {};

  constructor(
    @Inject(ENTITY_CACHE_NAME_TOKEN) private cacheName: string,
    @Inject(CREATE_ENTITY_DISPATCHER_TOKEN) dispatcher: any,
    private actions$: EntityActions,
    private entityDefinitionService: EntityDefinitionService,
    private store: Store<EntityCache>
  ) {
    // AOT type limitations oblige this indirection.
    this.createDispatcher = dispatcher;
    // This service applies to the cache in ngrx/store named `cacheName`
    this.cacheSelector = createFeatureSelector(this.cacheName);
  }

  /**
   * Create an EntityService for an entity type
   * @param entityName - name of the entity type
   */
  create<T, S extends EntityService<T> = EntityService<T>>(entityName: string): S {
    entityName = entityName.trim();
    const def = this.entityDefinitionService.getDefinition<T>(entityName);
    const dispatcher = this.createDispatcher<T>(entityName, this.store, def.selectId);
    const selectors$ = createEntitySelectors$(
      entityName,
      this.store,
      this.cacheSelector,
      def.selectors,
      def.initialState,
    );

    // map the ngrx/entity standard selector names to preferred EntityService selector names
    // that do not have the `select` prefix.
    const {
      selectAll$: entities$,
      selectCount$: count$,
      selectEntities$: entityKeyMap$,
      selectFilter$: filter$,
      selectFilteredEntities$: filteredEntities$,
      selectKeys$: keys$,
      selectLoading$: loading$,
      ...rest
    } = selectors$;

    const selectors$Mapped = {
      actions$: this.actions$.ofEntityType(entityName),
      count$,
      entityKeyMap$,
      entities$,
      filter$,
      filteredEntities$,
      keys$,
      loading$,
      ...rest
    };

    return <S> <any> Object.assign(dispatcher, selectors$Mapped);
  }
}
