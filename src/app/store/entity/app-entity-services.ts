import { Injectable } from '@angular/core';
import { EntityServicesElements, EntityServicesBase } from 'ngrx-data';

import { HeroesService } from '../../heroes/heroes.service';
import { VillainsService } from '../../villains/villains.service';

@Injectable()
export class AppEntityServices extends EntityServicesBase {
  constructor(
    entityServicesElements: EntityServicesElements,
    // Inject custom services, register them with the EntityServices, and expose in API.
    public readonly heroesService: HeroesService,
    public readonly villainsService: VillainsService
  ) {
    super(entityServicesElements);
    this.registerEntityCollectionServices([heroesService, villainsService]);
  }

  // ... Additional convenience members
}
