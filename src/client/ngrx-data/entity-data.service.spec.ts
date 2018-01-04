import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { createEntityDefinition, EntityDefinition } from './entity-definition';
import { EntityMetadata, EntityMetadataMap } from './entity-metadata';
import { ENTITY_METADATA_TOKEN } from './interfaces';
import { Pluralizer, _Pluralizer } from './pluralizer';
import { BasicDataService } from './basic-data.service';

import { EntityDataService, EntityDataServiceConfig } from './entity-data.service';

class CustomDataService extends BasicDataService<any> {
  constructor(entityName: string) {
    super(null, {api: 'test/api', entityName: 'Test' + entityName});
    this._name = `${this.entityName} CustomDataService`;
  }
}

describe('EntityDataService', () => {
  const config = {api: 'api'};
  const nullHttp = {};
  let entityDataService: EntityDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EntityDataService,
        { provide: EntityDataServiceConfig, useValue: config},
        { provide: HttpClient, useValue: nullHttp },
        { provide: Pluralizer, useClass: _Pluralizer }
      ]
    });
    entityDataService = TestBed.get(EntityDataService);
  })

  describe('#getService', () => {

    it('can create a data service for "Hero" entity', () => {
      const service = entityDataService.getService('Hero');
      expect (service).toBeDefined();
    });

    it('can data service is a BasicDataService by default', () => {
      const service = entityDataService.getService('Hero');
      expect (service instanceof BasicDataService).toBe(true);
    });

    it('gets the same service every time you ask for it', () => {
      const service1 = entityDataService.getService('Hero');
      const service2  = entityDataService.getService('Hero');
      expect(service1).toBe(service2);
    });
  });

  describe('#register...', () => {
    it('can register a custom service for "Hero"', () => {
      const customService = new CustomDataService('Hero');
      entityDataService.registerService('Hero', customService);

      const service = entityDataService.getService('Hero')
      expect(service).toBe(customService);
    });

    it('can register multiple custom services at the same time', () => {
      const customHeroService = new CustomDataService('Hero');
      const customVillainService = new CustomDataService('Villain');
      entityDataService.registerServices({
        Hero: customHeroService,
        Villain: customVillainService
      });

      let service = entityDataService.getService('Hero')
      expect(service).toBe(customHeroService, 'custom Hero data service');
      expect (service.name).toBe('TestHero CustomDataService');

      service = entityDataService.getService('Villain')
      expect(service).toBe(customVillainService, 'custom Villain data service');

      // Other services are still BasicDataServices
      service = entityDataService.getService('Foo');
      expect (service.name).toBe('Foo BasicDataService');
    });

  });
});
