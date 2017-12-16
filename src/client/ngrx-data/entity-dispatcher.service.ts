import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { EntityCache, EntityClass, getEntityName } from './interfaces';

import { EntityDispatcher } from './entity-dispatcher';

@Injectable()
export class EntityDispatcherService {
  constructor(private store: Store<EntityCache>) {}

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
}
