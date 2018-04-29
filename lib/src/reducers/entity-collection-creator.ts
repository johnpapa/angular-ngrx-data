import { Injectable, Optional } from '@angular/core';

import { EntityCollection } from './entity-collection';
import { EntityDefinitionService } from '../entity-metadata/entity-definition.service';

@Injectable()
export class EntityCollectionCreator {
  constructor(
    @Optional() private entityDefinitionService?: EntityDefinitionService
  ) {}

  /**
   * Create the default collection for an entity type.
   * @param entityName {string} entity type name
   */
  create<T = any, S extends EntityCollection<T> = EntityCollection<T>>(
    entityName: string
  ): S {
    const def =
      this.entityDefinitionService &&
      this.entityDefinitionService.getDefinition<T>(
        entityName,
        /*shouldThrow*/ false
      );

    const initialState = def && def.initialState;

    return <S>(initialState || createEmptyEntityCollection<T>());
  }
}

export function createEmptyEntityCollection<T>(): EntityCollection<T> {
  return {
    ids: [],
    entities: {},
    filter: undefined,
    loaded: false,
    loading: false,
    originalValues: {}
  } as EntityCollection<T>;
}
