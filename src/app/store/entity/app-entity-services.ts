import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  EntityCache,
  EntityCollectionServiceFactory,
  EntityServicesBase
} from 'ngrx-data';

import { HeroesService } from '../../heroes/heroes.service';
import { VillainsService } from '../../villains/villains.service';

@Injectable()
export class AppEntityServices extends EntityServicesBase {
  constructor(
    public readonly store: Store<EntityCache>,
    public readonly entityCollectionServiceFactory: EntityCollectionServiceFactory,
    // Inject custom services, register them with the EntityServices, and expose in API.
    public readonly heroesService: HeroesService,
    public readonly villainsService: VillainsService
  ) {
    super(store, entityCollectionServiceFactory);
    this.registerEntityCollectionServices([heroesService, villainsService]);
  }

  // ... Additional convenience members
}
