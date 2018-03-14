import { EntityAdapter, EntityState } from '@ngrx/entity';

import { defaultSelectId, IdSelector, Update } from '../utils';
import { EntityCollection } from './entity-collection';

// Methods needed by EntityChangeTracker to mutate the collection
// The minimum subset of the @ngrx/entity EntityAdapter methods.
export interface CollectionMutator<T> {
  addMany<S extends EntityState<T>>(entities: T[], state: S): S;
  removeMany<S extends EntityState<T>>(keys: string[], state: S): S;
}

export class EntityChangeTracker<T> {
  constructor(
    public name: string,
    private mutator: CollectionMutator<T>,
    private selectId?: IdSelector<T>) {
    /** Extract the primary key (id); default to `id` */
    this.selectId = selectId || defaultSelectId;
  }

  /**
   * Add entities to tracker by adding them to the collection's originalValues.
   * @param collection Source entity collection
   * @param idsSource  Array of id sources which could be an id,
   * an entity or an entity update
   */
  addToTracker(collection: EntityCollection<T>,
    idsSource: (number | string | T | Update<T>)[]): EntityCollection<T> {
    let ids: (number | string)[] = (idsSource || []).map(
      (source: any) => typeof source === 'object' ?
        source.id && source.changes ? source.id : this.selectId(source) :
        source
    );

    let originalValues = collection.originalValues;

    // add only the ids that aren't currently tracked
    ids = ids.filter(id => !originalValues.hasOwnProperty(id))
    if (ids.length === 0) {
      return collection;
    }

    const entities = collection.entities;
    originalValues = { ...originalValues }; // clone it

    // when entities[id] === undefined, it's a revertable "add"
    ids.forEach(id => originalValues[id] = entities[id]);
    return { ...collection, originalValues };
  }

  /**
   * Remove given entities from tracker by removing them from original values.
   * Those entities can no longer be reverted to their original values.
   * @param collection Entity collection with originalValues
   * @param ids Ids of entities whose original values should be removed.
   */
  removeFromTracker(collection: EntityCollection<T>, ids?: (number | string)[])
  : EntityCollection<T> {
    let originalValues = collection.originalValues;
    ids = (ids || []).filter(id => originalValues.hasOwnProperty(id));
    if (ids.length === 0) {
      return collection;
    }
    originalValues = { ...originalValues }; // clone it
    ids.forEach(id => delete originalValues[id])
    return { ...collection, originalValues };
  }

  /**
   * Revert entities with given ids to their original values.
   * @param collection Source entity collection
   * @param ids Ids of entities to revert to original values
   */
  revert(collection: EntityCollection<T>, ids: (number|string)[]): EntityCollection<T> {
    const newCollection = this._revertCore(collection, ids);
    return newCollection === collection ? collection : this.removeFromTracker(newCollection, ids);
  }

  /**
   * Revert every entity that is tracked in originalValues
   * @param collection Source entity collection
   */
  revertAll(collection: EntityCollection<T>) {
    const ids = Object.keys(collection.originalValues);
    return ids.length === 0 ? collection :
      {...this._revertCore(collection, ids), originalValues: {}};
  }

  private _revertCore(collection: EntityCollection<T>, ids: (number|string)[]): EntityCollection<T> {
    const originalValues = collection.originalValues;
    ids = (ids || []).filter(id => originalValues.hasOwnProperty(id));
    if (ids.length === 0) {
      return collection;
    }

    // TODO: consider a more efficient approach than removing and adding
    collection = this.mutator.removeMany(<any[]>ids, collection);

    // `falsey` original entity indicates an added entity that should be removed
    const originals = ids.map(id => originalValues[id]).filter(o => !!o);
    return originals.length === 0 ? collection : this.mutator.addMany(originals, collection);
  }
}
