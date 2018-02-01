import { Inject, Injectable } from '@angular/core';
import { createFeatureSelector, Selector, Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { filter, share, takeUntil, tap } from 'rxjs/operators';

import { EntityAction, EntityActions } from './entity.actions';
import { Dictionary } from './ngrx-entity-models';

import { EntityCache, ENTITY_CACHE_NAME_TOKEN, CREATE_ENTITY_DISPATCHER_TOKEN } from './interfaces';
import { EntityDefinitionService } from './entity-definition.service';
import { EntityDispatcher, createEntityDispatcher } from './entity-dispatcher';
import { createEntitySelectors$, EntitySelectors$ } from './entity.selectors';

// tslint:disable:member-ordering
export interface EntityService<T> {
  /*** COMMANDS ***/

  /**
   * Add an entity to the cache.
   * Does not save to remote storage.
   * Ignored if the entity is already in cache.
   */
  add(entity: T): void;

  /** Clear the cached entity collection */
  clear(): void;

  /** Remove an entity by key from the cache. Does not delete from remote storage. */
  delete(key: string | number): void;

  /**
   * Query remote storage for all entities and
   * completely replace the cached collection with the queried entities.
   */
  getAll(): void;

  /**
   * Query remote storage for the entity with this primary key
   * and replace the cached entity with the result if found.
   */
  getByKey(key: any): void;

  /**
   * Update the an entity to the cache.
   * Does not save to remote storage.
   * Ignored if the entity's key is not found in cache.
   * The update entity may be partial (but must have its key)
   * in which case it patches the existing entity.
   */
  update(entity: Partial<T>): void;

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
