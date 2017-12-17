import { Inject, Injectable, Optional } from '@angular/core';
import { Store } from '@ngrx/store';

import { EntityCache, ENTITY_CACHE_NAME, EntityClass, getEntityName } from './interfaces';
import { EntityDefinitionService } from './entity-definition.service';
import { EntityDispatcher } from './entity-dispatcher';
import { EntitySelectors$ } from './entity.selectors';

@Injectable()
export class EntityService {
  private readonly selectorSets: { [name: string]: EntitySelectors$<any> };

  constructor(
    entityDefinitionService: EntityDefinitionService,
    @Optional()
    @Inject(ENTITY_CACHE_NAME)
    public cacheName: string,
    private store: Store<EntityCache>
  ) {
    this.cacheName = this.cacheName || 'entityCache';
    this.selectorSets = entityDefinitionService.getAllEntitySelectors$(store, this.cacheName);
  }

  /**
   * Get (or create) a dispatcher for entity type
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
   * Get the selector$ for a particular entity type.
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
    const selectors$: EntitySelectors$<T> = this.selectorSets[entityName];
    if (!selectors$) {
      throw new Error(`Cannot find entity selectors$ for "${entityName}".`);
    }
    return selectors$;
  }
}
