import { Injectable } from '@angular/core';
import { Villain, IdGeneratorService } from '../core';

import { AppSelectors } from '../store/app-config';
import { EntityServiceBase, EntityServiceFactory } from 'ngrx-data';

import { FilterObserver } from '../shared/filter';
import { shareReplay, tap } from 'rxjs/operators';

@Injectable()
export class VillainsService extends EntityServiceBase<Villain> {
  filterObserver: FilterObserver;

  /** Run `getAll` if the datasource changes. */
  getAllOnDataSourceChange = this.appSelectors.dataSource$().pipe(
    tap(_ => this.getAll()),
    shareReplay(1)
  );
  constructor(
    entityServiceFactory: EntityServiceFactory,
    private appSelectors: AppSelectors,
    private idGenerator: IdGeneratorService) {
    super('Villain', entityServiceFactory);

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
    super.add(villain);
  }
}
