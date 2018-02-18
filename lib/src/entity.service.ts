import { Injectable } from '@angular/core';

import { EntityDefinitionService } from './entity-definition.service';
import { EntityDispatcher, EntityDispatcherFactory } from './entity-dispatcher';
import { EntitySelectors$, EntitySelectors$Factory } from './entity.selectors$';

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
  constructor(
    private entityDispatcherFactory: EntityDispatcherFactory,
    private entityDefinitionService: EntityDefinitionService,
    private entitySelectors$Factory: EntitySelectors$Factory
  ) { }

  /**
   * Create an EntityService for an entity type
   * @param entityName - name of the entity type
   */
  create<T, S extends EntityService<T> = EntityService<T>>(entityName: string): S {
    entityName = entityName.trim();
    const def = this.entityDefinitionService.getDefinition<T>(entityName);
    const dispatcher =
      this.entityDispatcherFactory.create<T>(entityName, def.selectId, def.entityDispatcherOptions);
    const selectors$ = this.entitySelectors$Factory.create(entityName, def.selectors);

    // Merge selectors$ properties into the dispatcher and return it
    return <S> <any> Object.assign(dispatcher, selectors$);
  }
}
