import { Injectable } from '@angular/core';

import { EntityCollection } from './entity-collection';
import { EntityDefinitionService } from '../entity-metadata/entity-definition.service';

@Injectable()
export class EntityCollectionCreator {

  constructor(private entityDefinitionService: EntityDefinitionService) { }

  /**
   * Create the default collection for an entity type.
   * @param entityName {string} entity type name
   */
  create<T = any, S extends EntityCollection<T> = EntityCollection<T>>(entityName: string): S {
    const def = this.entityDefinitionService.getDefinition<T>(entityName, /*shouldThrow*/ false);
    return <S> (def ?
      def.initialState || createEmptyEntityCollection<T>() :
      createEmptyEntityCollection<T>());
  }
}

export function createEmptyEntityCollection<T>(): EntityCollection<T> {
  return  {
    ids: [],
    entities: {},
    filter: undefined,
    loaded: false,
    loading: false,
    originalValues: {}
  } as EntityCollection<T>;
}
