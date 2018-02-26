import { Injectable, OnDestroy } from '@angular/core';
import { EntityServiceBase, EntityServiceFactory } from 'ngrx-data';

import { Subscription } from 'rxjs/Subscription';

import { AppSelectors } from '../store/app-config';
import { Hero } from '../core';
import { FilterObserver } from '../shared/filter';

@Injectable()
export class HeroesService extends EntityServiceBase<Hero> implements OnDestroy {
  private subscription: Subscription;

  filterObserver: FilterObserver;

  constructor(
    entityServiceFactory: EntityServiceFactory,
    private appSelectors: AppSelectors) {
    super('Hero', entityServiceFactory);

    /** User's filter pattern */
    this.filterObserver = {
      filter$: this.filter$,
      setFilter: this.setFilter.bind(this)
    };
  }

  initialize() {
    if (!this.subscription) {
      // Re-fetch all when toggle between local and remote web api
      this.subscription = this.appSelectors.dataSource$().subscribe(() => this.getAll());
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
