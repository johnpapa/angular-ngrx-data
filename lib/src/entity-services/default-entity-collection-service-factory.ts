import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';

import { EntityCache } from '../reducers/entity-cache';
import { EntityDefinitionService } from '../entity-metadata/entity-definition.service';
import { EntityDispatcherFactory } from '../dispatchers/entity-dispatcher-factory';
import { EntitySelectorsFactory } from '../selectors/entity-selectors';
import {
  EntitySelectors$,
  EntitySelectors$Factory
} from '../selectors/entity-selectors$';
import {
  EntityCollectionService,
  EntityCollectionServiceElements,
  EntityCollectionServiceFactory
} from './entity-services-interfaces';
import { EntityCollectionServiceBase } from './entity-collection-service-base';

/**
 * Creates EntityCollectionService instances for
 * a cached collection of T entities in the ngrx store.
 */
@Injectable()
export class DefaultEntityCollectionServiceFactory
  implements EntityCollectionServiceFactory {
  entityCache$: Observable<EntityCache> | Store<EntityCache>;

  constructor(
    private entityDispatcherFactory: EntityDispatcherFactory,
    private entityDefinitionService: EntityDefinitionService,
    private entitySelectorsFactory: EntitySelectorsFactory,
    private entitySelectors$Factory: EntitySelectors$Factory
  ) {
    this.entityCache$ = entitySelectors$Factory.entityCache$;
  }

  getEntityCollectionServiceElements<
    T,
    S$ extends EntitySelectors$<T> = EntitySelectors$<T>
  >(entityName: string): EntityCollectionServiceElements<T, S$> {
    entityName = entityName.trim();
    const definition = this.entityDefinitionService.getDefinition<T>(
      entityName
    );
    const dispatcher = this.entityDispatcherFactory.create<T>(
      entityName,
      definition.selectId,
      definition.entityDispatcherOptions
    );
    const selectors = this.entitySelectorsFactory.create<T>(
      definition.metadata
    );
    const selectors$ = this.entitySelectors$Factory.create<T, S$>(
      entityName,
      selectors
    );

    return {
      entityName,
      dispatcher,
      selectors,
      selectors$
    };
  }
  /**
   * Create an EntityCollectionService for an entity type
   * @param entityName - name of the entity type
   */
  create<T, S$ extends EntitySelectors$<T> = EntitySelectors$<T>>(
    entityName: string
  ): EntityCollectionService<T> {
    const service = new EntityCollectionServiceBase<T, S$>(entityName, this);
    return service;
  }
}
