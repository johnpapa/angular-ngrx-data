import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { EntityAction, EntityActionFactory } from '../actions/entity-action';
import { EntityActionGuard } from '../actions/entity-action-guard';
import { EntityOp } from '../actions/entity-op';
import { QueryParams } from '../dataservices/interfaces';
import { EntityCommands } from './entity-commands';
import { EntityCache } from '../reducers/entity-cache';
import { EntityDispatcher, EntityDispatcherBase, EntityDispatcherOptions } from './entity-dispatcher';
import { defaultSelectId, IdSelector, Update, toUpdateFactory } from '../utils';

@Injectable()
export class EntityDispatcherFactory {

  /**
   * Default dispatcher options.
   * These defaults are the safest values.
   */
  defaultDispatcherOptions = {
    optimisticAdd: false,
    optimisticDelete: true,
    optimisticUpdate: false,
  };

  constructor(
    private entityActionFactory: EntityActionFactory,
    private store: Store<EntityCache>
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
    /** Options that influence dispatcher behavior such as whether
     * `add()` is optimistic or pessimistic;
     */
    dispatcherOptions: Partial<EntityDispatcherOptions> = {}
  ): EntityDispatcher<T> {
    // merge w/ dispatcher options with defaults
    const options: EntityDispatcherOptions =
      Object.assign({}, this.defaultDispatcherOptions, dispatcherOptions);
    return new EntityDispatcherBase<T>(entityName, this.entityActionFactory, this.store, selectId, options)}
}

