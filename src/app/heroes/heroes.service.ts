import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from 'ngrx-data';

import { shareReplay, tap } from 'rxjs/operators';

import { AppSelectors } from '../store/app-config';
import { FilterObserver } from '../shared/filter';
import { Hero } from '../core';

@Injectable({ providedIn: 'root' })
export class HeroesService extends EntityCollectionServiceBase<Hero> {
  filterObserver: FilterObserver;

  /** Run `getAll` if the datasource changes. */
  getAllOnDataSourceChange = this.appSelectors.dataSource$.pipe(tap(_ => this.getAll()), shareReplay(1));

  constructor(private appSelectors: AppSelectors, serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Hero', serviceElementsFactory);

    /** User's filter pattern */
    this.filterObserver = {
      filter$: this.filter$,
      setFilter: this.setFilter.bind(this)
    };
  }
}
