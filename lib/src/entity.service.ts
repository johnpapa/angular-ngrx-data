import { Inject, Injectable } from '@angular/core';
import { createFeatureSelector, Selector, Store } from '@ngrx/store';

import { EntityActions } from './entity.actions';

import { EntityCache, ENTITY_CACHE_NAME_TOKEN, CREATE_ENTITY_DISPATCHER_TOKEN } from './interfaces';
import { EntityDefinitionService } from './entity-definition.service';
import { createEntityDispatcher, EntityDispatcher } from './entity-dispatcher';
import { createEntitySelectors$, EntitySelectors$ } from './entity.selectors$';

/**
 * A dispatcher and selector$ facade for managing
 * a cached collection of T entities in the ngrx store.
 */
export interface EntityService<T> extends EntityDispatcher<T>, EntitySelectors$<T> { }

/**
 * Creates EntityService instances for
 * a cached collection of T entities in the ngrx store.
 */
@Injectable()
export class EntityServiceFactory {
  private createDispatcher: typeof createEntityDispatcher;
  private cacheSelector: Selector<Object, EntityCache>;

  constructor(
    @Inject(ENTITY_CACHE_NAME_TOKEN) private cacheName: string,
    @Inject(CREATE_ENTITY_DISPATCHER_TOKEN) createDispatcher: any,
    private actions$: EntityActions,
    private entityDefinitionService: EntityDefinitionService,
    private store: Store<EntityCache>
  ) {
    // AOT type limitations oblige this indirection.
    this.createDispatcher = createDispatcher;
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

    // Merge selectors$ properties into the dispatcher and return it
    return <S> <any> Object.assign(dispatcher, selectors$);
  }
}
