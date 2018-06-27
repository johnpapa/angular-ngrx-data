import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { EntityCache } from '../reducers/entity-cache';
import { EntityDispatcherFactory } from '../dispatchers/entity-dispatcher-factory';
import { EntitySelectors$Factory } from '../selectors/entity-selectors$';
import { EntityCollectionServiceFactory } from './entity-collection-service-factory';

/** Core ingredients of an EntityServices class */
@Injectable()
export class EntityServicesElements {
  constructor(
    /**
     * Creates EntityCollectionService instances for
     * a cached collection of T entities in the ngrx store.
     */
    public readonly entityCollectionServiceFactory: EntityCollectionServiceFactory,
    /** Creates EntityDispatchers for entity collections */
    public readonly entityDispatcherFactory: EntityDispatcherFactory,
    /** Creates observable EntitySelectors$ for entity collections. */
    public readonly entitySelectors$Factory: EntitySelectors$Factory,
    /** The ngrx store, scoped to the EntityCache */
    public readonly store: Store<EntityCache>
  ) {}
}
