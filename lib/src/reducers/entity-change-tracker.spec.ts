import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { EntityCollection } from './entity-collection';
import { createEmptyEntityCollection } from './entity-collection-creator';
import { IdSelector, Update } from '../utils';

import { EntityChangeTracker } from './entity-change-tracker';

interface Hero {
  id: number;
  name: string;
  power?: string;
}

function sortByName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name);
}

const adapter: EntityAdapter<Hero> = createEntityAdapter<Hero>({
  sortComparer: sortByName
});

describe('EntityChangeTracker', () => {

  let origCollection: EntityCollection<Hero>;
  let collection: EntityCollection<Hero>;

  let tracker: EntityChangeTracker<Hero>;
  beforeEach(() => {
    tracker = new EntityChangeTracker('Hero', adapter);

    origCollection = createEmptyEntityCollection<Hero>();
    origCollection.entities = {
      1: {id: 1, name: 'Alice', power: 'Strong'},
      2: {id: 2, name: 'Gail', power: 'Loud'},
      7: {id: 7, name: 'Bob', power: 'Swift'},
    }
    origCollection.ids = [1, 7, 2];
  });

  describe('#addToTracker', () => {

    it('should return a new collection after adding an entity', () => {
      collection = tracker.addToTracker(origCollection, [1]);
      expect(collection).not.toBe(origCollection);
    });

    it('can add tracking of existing entity by id', () => {
      collection = tracker.addToTracker(origCollection, [1]);
      expect(collection.originalValues[1]).toBe(collection.entities[1]);
    });

    it('can add tracking of existing entity by entity', () => {
      const entity = origCollection.entities[1];
      collection = tracker.addToTracker(origCollection, [entity]);
      expect(collection.originalValues[1]).toBe(entity);
    });

    it('can add tracking of existing entity by Update<T>', () => {
      const entity = origCollection.entities[1];
      const update = { id: 1, changes: entity };
      collection = tracker.addToTracker(origCollection, [update]);
      expect(collection.originalValues[1]).toBe(entity);
    });

    it('can add tracking of several existing entities', () => {
      const entity = origCollection.entities[1];
      const update = { id: 2, changes: origCollection.entities[2] };

      collection = tracker.addToTracker(origCollection,
         [7, entity, update]);

      const originals = collection.originalValues;

      expect(Object.keys(originals)).toEqual(['1', '2', '7']);
      expect(originals[1]).toBe(entity);
      expect(originals[2]).toBe(update.changes);
      expect(originals[7]).toBe(origCollection.entities[7]);
    });

    it('should return a new collection when it updates originalValues', () => {
      collection = tracker.addToTracker(origCollection, [1]);
      expect(collection).not.toBe(origCollection);
    });

    it('tracked entity should be undefined when not in cache (indicates revertable "add")', () => {
      collection = tracker.addToTracker(origCollection, [42]);
      expectIsTracked(42);
    });

    it('should preserve first tracked original when tracked a second time', () => {
      const origHero = origCollection.entities[1];
      collection = tracker.addToTracker(origCollection, [1]);

      // change the cached hero id:1
      collection = adapter.updateOne({id: 1, changes: {name: 'xxx'}}, collection);
      expect(collection.entities[1].name).toBe('xxx', 'name changed in cache');

      // second tracking of id:1 which has changed; should be ignored.
      collection = tracker.addToTracker(origCollection, [1]);
      expect(collection.originalValues[1]).toBe(origHero, 'original preserved');
    });
  });

  describe('#revert', () => {

    it('should revert an added entity', () => {
      // track entities 1 & 7
      collection = tracker.addToTracker(origCollection, [7, 1]);

      // Track it BEFORE adding to the collection
      const entity = { id: 42, name: 'Smokey', power: 'Invisible'};
      collection = tracker.addToTracker(collection, [entity])
      expectIsTracked(42);
      expect(collection.originalValues[42]).toBeUndefined('id:42 represented by undefined');

      // Now add id:42
      collection = adapter.addMany([entity], collection);
      expect(collection.ids).toEqual([1, 7, 2, 42], 'added id:42');

      collection = tracker.revert(collection, [42]);

      expect(collection.ids).toEqual([1, 7, 2], 'restored ids, in sort order');
      expectIsNotTracked(42);
      expectIsTracked(1);
    });

    it('should NOT revert added entity when tracked after add', () => {
      // track entities 1 & 7
      collection = tracker.addToTracker(origCollection, [7, 1]);

      // Add before track. Probably not what you intended!
      const entity = { id: 42, name: 'Smokey', power: 'Invisible'};
      collection = adapter.addMany([entity], collection);

      // Add to tracker AFTER adding to the collection
      collection = tracker.addToTracker(collection, [entity])
      expect(collection.originalValues[42]).toBe(entity, 'tracking added entity');

      expect(collection.ids).toEqual([1, 7, 2, 42], 'added id:42');

      collection = tracker.revert(collection, [42]);

      // Not what you intended
      expect(collection.ids).toEqual([1, 7, 2, 42], 'ids are the same');
      expect(collection.entities[42]).toBe(entity, 'added entity still there');
      expectIsNotTracked(42); // does stop tracking it
      expectIsTracked(1);
    });

    it('should revert a deleted entity', () => {
      // track entities 1 & 7
      collection = tracker.addToTracker(origCollection, [7, 1]);
      const entity = origCollection.entities[7];

      // "delete" id:7
      collection = adapter.removeMany([7], collection);
      expect(collection.ids).toEqual([ 1 , 2], 'removed id:7');

      collection = tracker.revert(collection, [7]);

      expect(collection.ids).toEqual([1, 7, 2], 'restored ids, in sort order');
      expect(collection.entities[7]).toBe(entity, 'id:7 entity was restored');
      expectIsNotTracked(7);
      expectIsTracked(1);
    });

    it('should revert an updated entity', () => {
      // track entities 1 & 7
      collection = tracker.addToTracker(origCollection, [7, 1]);

      // update id:7
      const entity = origCollection.entities[7];
      const update = { id: 7, changes: { power: 'test-power' } };
      collection = adapter.updateOne(update, collection);

      expect(collection.entities[7].power).toBe('test-power', 'updated power');

      collection = tracker.revert(collection, [7]);

      expect(collection.entities[7]).toBe(entity, 'id:7 entity was restored');
      expect(collection.entities[7].power).toBe(entity.power, 'id:7 has same power');
      expectIsNotTracked(7);
      expectIsTracked(1);
    });

    it('should not revert an untracked, updated entity', () => {
      const update = { id: 7, changes: { id: 7, power: 'test-power' } };

      // not tracked before update
      collection = adapter.updateOne(update, origCollection);
      expect(collection.entities[7].power).toBe('test-power', 'updated power');

      collection = tracker.revert(collection, [7]);
      expect(collection.entities[7].power).toBe('test-power', 'did not revert power');
      expectIsNotTracked(7);
    });

    it('should revert several entities', () => {
      collection = tracker.addToTracker(origCollection, [1, 2, 7, 42]);

      const entity = { id: 42, name: 'Smokey', power: 'Invisible'};
      const entity7 = collection.entities[7];
      const update = { id: 7, changes: {id: 7, power: 'test-power' } };

      collection = adapter.addMany([entity], collection);
      collection = adapter.removeMany([1, 2], collection);
      collection = adapter.updateOne(update, collection);

      // revert all but id:2
      collection = tracker.revert(collection, [1, 7, 42]);

      // restored deleted id:1 but not id:2; removed added id:42
      expect(collection.ids).toEqual([1, 7]);
      expect(collection.entities[7]).toBe(entity7);
      expect(Object.keys(collection.originalValues)).toEqual(['2'], 'only id:2 still tracked');
    });

    it('should return original collection when none of the entities are tracked', () => {
      collection = tracker.revert(origCollection, [1, 2, 7]);
      expect(collection).toBe(origCollection);
    });

    it('should return original collection when asked to revert no entities', () => {
      const trackingCollection = tracker.addToTracker(origCollection, [1, 7, 42]);
      collection = tracker.revert(trackingCollection, []);
      expect(collection).toBe(trackingCollection);
    })

    it('cannot (yet) revert an update that changes the primary key', () => {
      collection = tracker.addToTracker(origCollection, [1]);
      const entity = collection.entities[1];
      const update = { id: 1, changes: { id: 42, name: 'test-name' }};

      collection = adapter.updateOne(update, collection);
      expect(collection.ids).toEqual([7, 2, 42], 'ids after update');

      // won't do it properly, even if you provide both ids
      collection = tracker.revert(collection, [1, 42]);

      // Both 1 and 42 are in cache!
      expect(collection.ids).toEqual([1, 7, 2, 42], 'ids improperly restored');
      expect(collection.ids).not.toEqual([1, 7, 2], 'ids if reverted correctly');

      expectIsNotTracked(1);
      expectIsNotTracked(42);
    });
  });

  describe('#revertAll', () => {
    it('should revert all tracked entity changes', () => {
      collection = tracker.addToTracker(origCollection, [1, 2, 7, 42]);

      const entity = { id: 42, name: 'Smokey', power: 'Invisible'};
      const entity7 = collection.entities[7];
      const update = { id: 7, changes: {id: 7, power: 'test-power' } };

      collection = adapter.addMany([entity], collection);
      collection = adapter.removeMany([1, 2], collection);
      collection = adapter.updateOne(update, collection);

      // revert all
      collection = tracker.revertAll(collection);

      expect(collection.ids).toEqual([1, 7, 2], 'ids after revert');
      expect(collection.entities[7]).toBe(entity7);
      expect(collection.originalValues).toEqual({});
    });

    it('should return original collection when there are no tracked entities', () => {
      collection = tracker.revertAll(origCollection);
      expect(collection).toBe(origCollection);
    });
  });

  describe('#removeFromTracker', () => {
    // TBD
  });

  /// test helpers ///
  function expectIsTracked(id: (number | string)) {
    expect(collection.originalValues.hasOwnProperty(id))
      .toBe(true, `hero ${id} is in originalValues`);
  }

  function expectIsNotTracked(id: (number | string)) {
    expect(collection.originalValues.hasOwnProperty(id))
      .toBe(false, `hero ${id} is in originalValues`);
  }
});
