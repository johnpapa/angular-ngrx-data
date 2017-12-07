import { Injectable } from '@angular/core';

import {
  EntityAction,
  EntityCache,
  EntityCollection,
  EntityDataService,
  EntityCollectionDataService
} from '../ngrx-data';

import { HeroDataService } from './hero-data.service';
import { VillainDataService } from './villain-data.service';

@Injectable()
export class AppDataService implements EntityDataService {
  constructor(
    private heroDataService: HeroDataService,
    private villainDataService: VillainDataService
  ) {}

  getService(action: EntityAction<any, any>): EntityCollectionDataService<any> {
    switch (action.entityTypeName) {
      case 'Hero': {
        return this.heroDataService;
      }
      case 'Villain': {
        return this.villainDataService;
      }
      default: {
        throw new Error(`No dataservice for ${action.entityTypeName}`);
      }
    }
  }
}
