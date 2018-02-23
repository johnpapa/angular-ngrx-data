import { Injectable, OnDestroy } from '@angular/core';
import { EntityServiceBase, EntityServiceFactory } from 'ngrx-data';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { AppSelectors } from '../store/app-config';
import { Hero } from '../core';

@Injectable()
export class HeroesService extends EntityServiceBase<Hero> implements OnDestroy {
  private subscription: Subscription;

  constructor(
    entityServiceFactory: EntityServiceFactory,
    private appSelectors: AppSelectors) {
    super('Hero', entityServiceFactory);
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
