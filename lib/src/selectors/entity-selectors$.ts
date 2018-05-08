import { Inject, Injectable } from '@angular/core';

import {
  createFeatureSelector,
  createSelector,
  Selector,
  Store
} from '@ngrx/store';

import { Observable } from 'rxjs';

import { Dictionary } from '../utils/ngrx-entity-models';
import { EntityAction } from '../actions/entity-action';
import { EntityActions } from '../actions/entity-actions';
import { OP_ERROR } from '../actions/entity-op';
import {
  ENTITY_CACHE_SELECTOR_TOKEN,
  EntityCacheSelector
} from './entity-cache-selector';
import { EntitySelectors } from './entity-selectors';
import { EntityCache } from '../reducers/entity-cache';
import { EntityCollection } from '../reducers/entity-collection';
import { EntityCollectionCreator } from '../reducers/entity-collection-creator';
import { EntitySelectorsFactory } from './entity-selectors';

/**
 * The selector observable functions for entity collection members.
 */
export interface EntitySelectors$<T> {
  /** Name of the entity collection for these selectors$ */
  readonly entityName: string;

  /** Observable of the collection as a whole */
  readonly collection$: Observable<EntityCollection> | Store<EntityCollection>;

  /** Observable of count of entities in the cached collection. */
  readonly count$: Observable<number> | Store<number>;

  /** Observable of all entities in the cached collection. */
  readonly entities$: Observable<T[]> | Store<T[]>;

  /** Observable of actions related to this entity type. */
  readonly entityActions$: EntityActions;

  /** Observable of the entire entity cache */
  readonly entityCache$: Observable<EntityCache> | Store<EntityCache>;

  /** Observable of the map of entity keys to entities */
  readonly entityMap$: Observable<Dictionary<T>> | Store<Dictionary<T>>;

  /** Observable of error actions related to this entity type. */
  readonly errors$: EntityActions;

  /** Observable of the filter pattern applied by the entity collection's filter function */
  readonly filter$: Observable<string> | Store<string>;

  /** Observable of entities in the cached collection that pass the filter function */
  readonly filteredEntities$: Observable<T[]> | Store<T[]>;

  /** Observable of the keys of the cached collection, in the collection's native sort order */
  readonly keys$: Observable<string[] | number[]> | Store<string[] | number[]>;

  /** Observable true when the collection has been loaded */
  readonly loaded$: Observable<boolean> | Store<boolean>;

  /** Observable true when a multi-entity query command is in progress. */
  readonly loading$: Observable<boolean> | Store<boolean>;

  /** Original entity values for entities with unsaved changes */
  readonly originalValues$: Observable<Dictionary<T>> | Store<Dictionary<T>>;
}

@Injectable()
export class EntitySelectors$Factory {
  /** Observable of the EntityCache */
  entityCache$: Observable<EntityCache>;

  constructor(
    private store: Store<any>,
    private entityActions$: EntityActions,
    @Inject(ENTITY_CACHE_SELECTOR_TOKEN)
    private selectEntityCache: EntityCacheSelector
  ) {
    // This service applies to the cache in ngrx/store named `cacheName`
    this.entityCache$ = this.store.select(this.selectEntityCache);
  }

  /**
   * Creates an entity collection's selectors$ observables for this factory's store.
   * `selectors$` are observable selectors of the cached entity collection.
   * @param entityName - is also the name of the collection.
   * @param selectors - selector functions for this collection.
   **/
  create<T, S$ extends EntitySelectors$<T> = EntitySelectors$<T>>(
    entityName: string,
    selectors?: EntitySelectors<T>
  ): S$ {
    const selectors$: { [prop: string]: any } = {
      entityName
    };

    Object.keys(selectors).forEach(name => {
      if (name.startsWith('select')) {
        // strip 'select' prefix from the selector fn name and append `$`
        // Ex: 'selectEntities' => 'entities$'
        const name$ = name[6].toLowerCase() + name.substr(7) + '$';
        selectors$[name$] = this.store.select((<any>selectors)[name]);
      }
    });
    selectors$.entityActions$ = this.entityActions$.ofEntityType(entityName);
    selectors$.errors$ = selectors$.entityActions$.where((ea: EntityAction) =>
      ea.op.endsWith(OP_ERROR)
    );
    return selectors$ as S$;
  }
}
