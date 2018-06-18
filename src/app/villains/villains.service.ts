import { Injectable } from '@angular/core';
import { Villain, IdGeneratorService } from '../core';

import { AppSelectors } from '../store/app-config';
import { EntityCollectionServiceBase, EntityCollectionServiceFactory } from 'ngrx-data';
import { FilterObserver } from '../shared/filter';
import { shareReplay, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class VillainsService extends EntityCollectionServiceBase<Villain> {
  filterObserver: FilterObserver;

  /** Run `getAll` if the datasource changes. */
  getAllOnDataSourceChange = this.appSelectors.dataSource$().pipe(tap(_ => this.getAll()), shareReplay(1));
  constructor(
    private entityCollectionServiceFactory: EntityCollectionServiceFactory,
    private appSelectors: AppSelectors,
    private idGenerator: IdGeneratorService
  ) {
    super('Villain', entityCollectionServiceFactory);

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
}
