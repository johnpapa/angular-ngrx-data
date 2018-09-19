import { Injectable } from '@angular/core';
import { Villain, IdGeneratorService } from '../core';

import { combineLatest, Observable } from 'rxjs';
import { filter, first, map, shareReplay, tap } from 'rxjs/operators';

import {
  ChangeSet,
  changeSetItemFactory as cif,
  EntityCacheDispatcher,
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory
} from 'ngrx-data';

import { AppSelectors } from '../store/app-config';
import { FilterObserver } from '../shared/filter';

@Injectable({ providedIn: 'root' })
export class VillainsService extends EntityCollectionServiceBase<Villain> {
  filterObserver: FilterObserver;

  /** Run `getAll` if the datasource changes. */
  getAllOnDataSourceChange = this.appSelectors.dataSource$.pipe(
    tap(_ => this.getAll()),
    shareReplay(1)
  );
  constructor(
    private appSelectors: AppSelectors,
    private entityCacheDispatcher: EntityCacheDispatcher,
    private idGenerator: IdGeneratorService,
    private serviceElementsFactory: EntityCollectionServiceElementsFactory
  ) {
    super('Villain', serviceElementsFactory);

    /** User's filter pattern */
    this.filterObserver = {
      filter$: this.filter$,
      setFilter: this.setFilter.bind(this)
    };
  }

  add(villain: Villain) {
    if (!villain.id) {
      // MUST generate missing id for villain because
      // Villain EntityMetadata is configured for optimistic ADD.
      const id = this.idGenerator.nextId();
      villain = { ...villain, id };
    }
    return super.add(villain);
  }

  // Demonstrates saveEntities
  deleteAll() {
    // Build the "change set" of all changes to process at one time.
    // An array of changeSetItems, each a specific kind of change to entities of an entity type.
    // Here an array with just one item: a delete for all entities of type Villain.
    const deleteAllChangeSet$ = (this.keys$ as Observable<number[]>).pipe(
      map(keys => {
        const changeSet: ChangeSet = {
          changes: [cif.delete('Villain', keys)],
          tag: 'DELETE ALL VILLAINS' // optional descriptive tag
        };
        return changeSet;
      })
    );

    combineLatest(deleteAllChangeSet$, this.appSelectors.dataSource$)
      .pipe(first(), map(x => x))
      .subscribe(([changeSet, source]) => {
        if (source === 'local') {
          // only works with in-mem db for this demo
          this.entityCacheDispatcher.saveEntities(
            changeSet,
            'api/save/delete-villains', // whatever your server expects
            { isOptimistic: true }
          );
        }
      });
  }
}
