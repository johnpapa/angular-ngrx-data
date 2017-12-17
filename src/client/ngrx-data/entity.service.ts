import { Inject, Injectable, OnDestroy } from '@angular/core';
import { createFeatureSelector, Selector, Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { filter, share, takeUntil, tap } from 'rxjs/operators';

import { EntityAction, EntityActions } from './entity.actions';

import {
  EntityCache, ENTITY_CACHE_NAME_TOKEN, EntityClass, getEntityName } from './interfaces';
import { EntityDefinitionService } from './entity-definition.service';
import { EntityDispatcher } from './entity-dispatcher';
import { createEntitySelectors$, EntitySelectors$ } from './entity.selectors';

@Injectable()
export class EntityService implements OnDestroy {

  private cacheSelector: Selector<Object, EntityCache>;
  private selectors$Map: { [entityName: string]: EntitySelectors$<any> } = {};
  private onDestroy = new Subject();

  /** Listen to any action related to entities. */
  allEntityActions$: EntityActions;

  constructor(
    @Inject(ENTITY_CACHE_NAME_TOKEN) private cacheName: string,
    private actions$: EntityActions,
    private entityDefinitionService: EntityDefinitionService,
    private store: Store<EntityCache>
  ) {
    // This service applies to the cache in ngrx/store named `cacheName`
    this.cacheSelector = createFeatureSelector(this.cacheName);

    /** Observe dispatching of an Entity-related action */
    this.allEntityActions$ = this.actions$.ofEntity()
      .until(this.onDestroy);

  }

  /** Listen to any action related to a given entity type. */
  getEntityActions$<T>(entityClass: EntityClass<T> | string):
    EntityActions<EntityAction<T>> {
    return this.actions$.ofEntityType<T>(entityClass)
      .until<T>(this.onDestroy);
  }

  /**
   * Get (or create) an ngrx/store dispatcher for the entity type.
   * @param entityClass - the class or the name of the type
   *
   * Examples:
   *   getDispatcher('Hero'); // dispatcher for Heroes, untyped
   *   getDispatcher(Hero);  // dispatcher for Heroes, typed with Hero class
   *   getDispatcher<Hero>('Hero'); // dispatcher for Heroes, typed with Hero interface
   */
  getDispatcher<T>(entityClass: EntityClass<T> | string): EntityDispatcher<T> {
    const entityName = getEntityName(entityClass);
    return new EntityDispatcher<T>(entityName, this.store);
  }

  /**
   * Get (or create) the selector$ for the entity type's cached collection.
   * The selectors$ are the cached collection Observables that
   * consumers (e.g., components) subscribe to.
   * @param entityClass - the class or the name of the type
   *
   * Examples:
   *   getSelectors$('Hero'); // selectors$ for Heroes, untyped
   *   getSelectors$(Hero);  // selectors$ for Heroes, typed with Hero class
   *   getSelectors$<Hero>('Hero'); // selectors$ for Heroes, typed with Hero interface
   */
  getSelectors$<T>(entityClass: EntityClass<T> | string): EntitySelectors$<T> {
    const entityName = getEntityName(entityClass);
    let selectors$ = this.selectors$Map[entityName];
    if (!selectors$) {
      // Not in this service; create selectors$ and remember them.
      const def = this.entityDefinitionService.getDefinition(entityClass);
      selectors$ = createEntitySelectors$(
        entityName, this.cacheSelector, def.initialState, def.selectors, this.store);
      this.selectors$Map[entityName] = selectors$;
    }
    return selectors$;
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }
}
