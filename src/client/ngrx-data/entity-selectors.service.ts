import { Inject, Injectable, Optional } from '@angular/core';
import { Store } from '@ngrx/store';

import { EntityDefinitionService } from './entity-definition.service';
import { EntityCache, ENTITY_CACHE_NAME, EntityClass, getEntityName } from './interfaces';
import { EntitySelectors$ } from './entity.selectors';

@Injectable()
export class EntitySelectorsService {
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
