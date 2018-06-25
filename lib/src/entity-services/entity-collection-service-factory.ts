import { Action, Store } from '@ngrx/store';

import { Observable } from 'rxjs';

import { EntityAction, EntityActionOptions } from '../actions/entity-action';
import { EntityCache } from '../reducers/entity-cache';
import { EntityCollectionService } from './entity-collection-service';
import { EntityCommands } from '../dispatchers/entity-commands';
import { EntityDispatcher } from '../dispatchers/entity-dispatcher';
import { EntityOp } from '../actions/entity-op';
import { EntitySelectors$ } from '../selectors/entity-selectors$';
import { EntitySelectors } from '../selectors/entity-selectors';

// tslint:disable:member-ordering

/** The sub-service members of an EntityCollectionService */
export interface EntityCollectionServiceElements<T, S$ extends EntitySelectors$<T> = EntitySelectors$<T>> {
  readonly dispatcher: EntityDispatcher<T>;
  readonly selectors: EntitySelectors<T>;
  readonly selectors$: S$;
}

export abstract class EntityCollectionServiceFactory {
  /**
   * Create an EntityCollectionService for an entity type
   * @param entityName - name of the entity type
   */
  abstract create<T, S$ extends EntitySelectors$<T> = EntitySelectors$<T>>(entityName: string): EntityCollectionService<T>;

  /** Observable of the entire entity cache */
  readonly entityCache$: Observable<EntityCache> | Store<EntityCache>;

  /**
   * Get the core sub-service elements.
   * A helper method for EntityCollectionServiceFactory implementors.
   */
  abstract getEntityCollectionServiceElements<T, S$ extends EntitySelectors$<T> = EntitySelectors$<T>>(
    entityName: string
  ): EntityCollectionServiceElements<T, S$>;
}
