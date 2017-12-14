import { Injectable } from '@angular/core';
import { EntityCollectionReducers } from './entity.reducer';
import { EntityDefinitions } from './entity-definition';
import { EntityDefinitionService } from './entity-definition.service';
import { createEntityReducer } from './entity.reducer';

@Injectable()
export class EntityReducerService {
  /** {EntityDefinitions} for all cached entity types */
  readonly entityReducers: EntityCollectionReducers = {};

  constructor(private entityDefinitionService: EntityDefinitionService) {}

  getReducer() {
    return createEntityReducer(this.entityDefinitionService);
  }
}
