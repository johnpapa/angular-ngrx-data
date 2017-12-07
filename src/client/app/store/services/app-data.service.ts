import {
  EntityAction, EntityCache, EntityCollection,
  EntityDataService, EntityCollectionDataService } from '../ngrx-data';

import { HeroDataService } from './hero-data.service';

export class AppDataService implements EntityDataService {

  constructor(private heroDataService: HeroDataService) { }

  getService(action: EntityAction<any, any>): EntityCollectionDataService<any> {
    switch (action.entityTypeName) {
      case 'Hero': {
        return this.heroDataService
      }
      default: {
        throw new Error(`No dataservice for ${action.entityTypeName}`);
      }
    }
  }
}
