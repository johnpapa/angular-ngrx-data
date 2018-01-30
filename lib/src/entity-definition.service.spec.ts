import { TestBed } from '@angular/core/testing';
import { createEntityDefinition, EntityDefinition } from './entity-definition';
import { EntityMetadata, EntityMetadataMap } from './entity-metadata';
import { ENTITY_METADATA_TOKEN } from './interfaces';

import { EntityDefinitionService } from './entity-definition.service';

describe('EntityDefinitionService', () => {

  let service: EntityDefinitionService;
  let metadataMap: EntityMetadataMap;

  beforeEach(() => {
    metadataMap = {
      Hero: { entityName: 'Hero' },
      Villain: { entityName: 'Villain' }
    };

    TestBed.configureTestingModule({
      providers: [
        EntityDefinitionService,
        { provide: ENTITY_METADATA_TOKEN, multi: true, useValue: metadataMap}
      ]
    });
    service = TestBed.get(EntityDefinitionService);
  })

  describe('#getDefinition', () => {
    it('returns definition for known entity', () => {
      const def = service.getDefinition('Hero');
      expect(def).toBeDefined();
    });

    it('throws if request definition for unknown entity', () => {
      expect(() => service.getDefinition('Foo')).toThrowError(/no entity/i);
    });

    it('returns undefined if request definition for unknown entity and `shouldThrow` is false', () => {
      const def = service.getDefinition('foo', /* shouldThrow */ false);
      expect(def).not.toBeDefined();
    });
  });

  describe('#registerMetadata(Map)', () => {
    it('can register a new definition by metadata', () => {
      service.registerMetadata({ entityName: 'Foo' });

      let def = service.getDefinition('Foo');
      expect(def).toBeDefined();
      // Hero is still defined after registering Foo
      def = service.getDefinition('Hero');
      expect(def).toBeDefined('Hero still defined');
    });
    it('can register new definitions by metadata map', () => {
      service.registerMetadataMap({
        Foo: {entityName: 'Foo' },
        Bar: {entityName: 'Bar' }
      });

      let def = service.getDefinition('Foo');
      expect(def).toBeDefined('Foo');
      def = service.getDefinition('Bar');
      expect(def).toBeDefined('Bar');
      def = service.getDefinition('Hero');
      expect(def).toBeDefined('Hero still defined');
    });
  });

  describe('#registerDefinition(s)', () => {
    it('can register a new definition', () => {
      const newDef = createEntityDefinition({ entityName: 'Foo' });
      service.registerDefinition(newDef);

      let def = service.getDefinition('Foo');
      expect(def).toBeDefined();
      // Hero is still defined after registering Foo
      def = service.getDefinition('Hero');
      expect(def).toBeDefined('Hero still defined');
    });

    it('can register a map of several definitions', () => {
      const newDefMap = {
        Foo: createEntityDefinition({ entityName: 'Foo' }),
        Bar: createEntityDefinition({ entityName: 'Bar' })
      };
      service.registerDefinitions(newDefMap);

      let def = service.getDefinition('Foo');
      expect(def).toBeDefined('Foo');
      def = service.getDefinition('Bar');
      expect(def).toBeDefined('Bar');
      def = service.getDefinition('Hero');
      expect(def).toBeDefined('Hero still defined');
    });

    it('can re-register an existing definition', () => {
      const testSelectId = (entity: any) => 'test-id';
      const newDef = createEntityDefinition({
        entityName: 'Hero',
        selectId: testSelectId
      });
      service.registerDefinition(newDef);

      const def = service.getDefinition('Hero');
      expect(def).toBeDefined('Hero still defined');
      expect(def.selectId).toBe(testSelectId, 'updated w/ new selectId')
    });
  });
});
