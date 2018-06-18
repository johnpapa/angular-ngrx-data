import { Inject, Injectable } from '@angular/core';
import { Action, Store, ScannedActionsSubject } from '@ngrx/store';
import { Observable } from 'rxjs';

import { CorrelationIdGenerator } from '../utils/correlation-id-generator';
import { DefaultDispatcherOptions } from './default-dispatcher-options';
import { defaultSelectId, toUpdateFactory } from '../utils/utilities';
import { EntityAction } from '../actions/entity-action';
import { EntityActionFactory } from '../actions/entity-action-factory';
import { EntityCache } from '../reducers/entity-cache';
import { EntityCacheSelector, ENTITY_CACHE_SELECTOR_TOKEN, createEntityCacheSelector } from '../selectors/entity-cache-selector';
import { EntityDispatcher } from './entity-dispatcher';
import { EntityDispatcherBase } from './entity-dispatcher-base';
import { EntityOp } from '../actions/entity-op';
import { IdSelector, Update } from '../utils/ngrx-entity-models';
import { QueryParams } from '../dataservices/interfaces';

@Injectable()
export class EntityDispatcherFactory {
  constructor(
    private entityActionFactory: EntityActionFactory,
    private store: Store<EntityCache>,
    private defaultDispatcherOptions: DefaultDispatcherOptions,
    @Inject(ScannedActionsSubject) private actions$: Observable<Action>,
    @Inject(ENTITY_CACHE_SELECTOR_TOKEN) private entityCacheSelector: EntityCacheSelector,
    private correlationIdGenerator: CorrelationIdGenerator
  ) {}

  /**
   * Create an `EntityDispatcher` for an entity type `T` and store.
   */
  create<T>(
    /** Name of the entity type */
    entityName: string,
    /**
     * Function that returns the primary key for an entity `T`.
     * Usually acquired from `EntityDefinition` metadata.
     */
    selectId: IdSelector<T> = defaultSelectId,
    /** Defaults for options that influence dispatcher behavior such as whether
     * `add()` is optimistic or pessimistic;
     */
    defaultOptions: Partial<DefaultDispatcherOptions> = {}
  ): EntityDispatcher<T> {
    // merge w/ dispatcher options with defaults
    const options: DefaultDispatcherOptions = { ...this.defaultDispatcherOptions, ...defaultOptions };
    return new EntityDispatcherBase<T>(
      entityName,
      this.entityActionFactory,
      this.store,
      selectId,
      options,
      this.actions$,
      this.entityCacheSelector,
      this.correlationIdGenerator
    );
  }
}
