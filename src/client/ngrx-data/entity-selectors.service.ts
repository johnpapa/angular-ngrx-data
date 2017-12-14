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
    @Optional() @Inject(ENTITY_CACHE_NAME) public cacheName: string,
    private store: Store<EntityCache>
  ) {
    this.cacheName = this.cacheName || 'entityCache';
    this.selectorSets = entityDefinitionService.getAllEntitySelectors$(store, this.cacheName)
  }

  /**
   * Get (or create) a dispatcher for entity type
   * @param entityClass - the class or the name of the class
   *
   * Examples:
   *   getDispatcher('Hero'); // dispatcher for Heroes, untyped
   *   getDispatcher(Hero);  // dispatcher for Heroes, typed with Hero class
   *   getDispatcher<Hero>('Hero'); // dispatcher for Heroes, typed with Hero interface
   */
  getSelectors$<T>(entityClass: EntityClass<T> | string): EntitySelectors$<T> {
    const entityName = getEntityName(entityClass);
    const selectors$: EntitySelectors$<T> = this.selectorSets[entityName];
    if (!selectors$) {
      throw new Error(`Cannot find entity selectors$ for "${entityName}".`)
    }
    return selectors$;
  }
}
