import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { createEntityDefinition, EntityDefinition } from './entity-definition';
import { EntityMetadata, EntityMetadataMap } from './entity-metadata';
import { ENTITY_METADATA_TOKEN } from './interfaces';
import { Pluralizer, _Pluralizer } from './pluralizer';
import { BasicDataService } from './basic-data.service';

import { EntityDataService, EntityDataServiceConfig } from './entity-data.service';
import { EntityCollectionDataService, QueryParams } from './interfaces';
import { Update } from 'ngrx-entity-models';

describe('EntityDataService', () => {
  const config = {api: 'api'};
  const nullHttp = {};
  let entityDataService: EntityDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ CustomDataServiceModule ],
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

    it('can register a custom service using a module import', () => {
      const service = entityDataService.getService('Bazinga');
      expect(service instanceof BazingaDataService).toBe(true);
    })

  });
});

///// Test Helpers /////

import { Optional } from '@angular/core';

export class CustomDataService extends BasicDataService<any> {
  constructor(entityName: string) {
    super(null, {api: 'test/api', entityName: 'Test' + entityName});
    this._name = `${this.entityName} CustomDataService`;
  }
}

export class Bazinga {
  id: number;
  wow: string
}

export class BazingaDataService implements EntityCollectionDataService<Bazinga> {
  name: string;

  // TestBed bug requires `@Optional` even though http is always provided.
  constructor(@Optional() private http: HttpClient) {
    if (!http) { throw new Error('Where is HttpClient?'); }
    this.name = 'Bazinga custom data service';
  }

  add(entity: Bazinga): Observable<Bazinga> { return this.bazinga(); }
  delete(id: any): Observable<null> { return this.bazinga(); }
  getAll(): Observable<Bazinga[]> { return this.bazinga(); }
  getById(id: any): Observable<Bazinga> { return this.bazinga(); }
  getWithQuery(params: string | QueryParams): Observable<Bazinga[]>  { return this.bazinga(); }
  update(update: Update<Bazinga>): Observable<Update<Bazinga>> { return this.bazinga(); }

  private bazinga(): any {
    bazingaFail();
    return undefined;
  }
}

@NgModule({
  providers: [
    BazingaDataService
  ]
})
export class CustomDataServiceModule {
  constructor(
    entityDataService: EntityDataService,
    bazingaService: BazingaDataService) {
    entityDataService.registerService('Bazinga', bazingaService);
  }
}

function bazingaFail() {
  throw new Error('Bazinga! This method is not implemented.');
}
