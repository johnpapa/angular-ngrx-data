import { Selector } from '@ngrx/store';

import { EntityCollection } from '../reducers';
import { EntityMetadata, EntityMetadataMap, PropsFilterFnFactory } from '../entity-metadata';

import { createEntitySelectors, EntitySelectors } from './entity-selectors';

describe('EntitySelectors', () => {

  /** HeroMetadata identifies the extra collection state properties */
  const heroMetadata: EntityMetadata<Hero> = {
    entityName: 'Hero',
    filterFn: nameFilter,
    additionalCollectionState: {
      foo: 'Foo',
      bar: 3.14
    }
  };

  const villainMetadata: EntityMetadata<Villain> = {
    entityName: 'Villain',
    selectId: (entity: Villain) => entity.key
  }

  describe('#createEntitySelectors', () => {

    it('should have expected Hero selectors (a super-set of EntitySelectors)', () => {
      const collection = <HeroCollection> <any> {
        ids: [42],
        entities: {42: {id: 42, name: 'A'}},
        filter: 'B',
        foo: 'Foo'
      };
      const selectors = createEntitySelectors<Hero, HeroSelectors>(heroMetadata);

      expect(selectors.selectEntities).toBeDefined('selectAll');
      expect(selectors.selectEntities(collection)).toEqual([{id: 42, name: 'A'}], 'try selectAll');

      expect(selectors.selectFilteredEntities(collection)).toEqual([], 'no matching heroes');

      expect(selectors.selectFoo).toBeDefined('selectFoo');
      expect(selectors.selectFoo(collection)).toBe('Foo', 'try selectFoo')
    });

    it('should have expected Villain selectors', () => {
      const collection = <EntityCollection<Villain>> <any> {
        ids: [24],
        entities: {24: {key: 'evil', name: 'A'}},
        filter: 'B' // doesn't matter because no filter function
      };
      const selectors = createEntitySelectors(villainMetadata);
      const expectedEntities = [{key: 'evil', name: 'A'}];

      expect(selectors.selectEntities).toBeDefined('selectAll');
      expect(selectors.selectEntities(collection)).toEqual(expectedEntities, 'try selectAll');

      expect(selectors.selectFilteredEntities(collection)).toEqual(expectedEntities,
        'all villains because no filter fn');
    });
  });

});

/////// Test values and helpers /////////

function nameFilter<T>(entities: T[], pattern: string) {
  return PropsFilterFnFactory<any>(['name'])(entities, pattern);
}

/// Hero
interface Hero {
  id: number;
  name: string;
}

/** HeroCollection is EntityCollection<Hero> with extra collection properties */
interface HeroCollection extends EntityCollection<Hero> {
  foo: string;
  bar: number;
}

/** HeroSelectors identifies the extra selectors for the extra collection properties */
interface HeroSelectors extends EntitySelectors<Hero> {
  selectFoo: Selector<HeroCollection, string>;
  selectBar: Selector<HeroCollection, number>;
}

/// Villain
interface Villain {
  key: string;
  name: string;
}
