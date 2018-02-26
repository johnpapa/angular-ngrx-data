import { Injectable, OnDestroy } from '@angular/core';
import { Villain, IdGeneratorService } from '../core';

import { AppSelectors } from '../store/app-config';
import { EntityServiceBase, EntityServiceFactory } from 'ngrx-data';

import { FilterObserver } from '../shared/filter';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class VillainsService extends EntityServiceBase<Villain> implements OnDestroy {
  private subscription: Subscription;

  filterObserver: FilterObserver;

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
