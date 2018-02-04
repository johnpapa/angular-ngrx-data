import { Store } from '@ngrx/store';

import { EntityDispatcher } from './entity-dispatcher';

import { EntityAction, EntityOp } from './entity.actions';
import { Update } from './ngrx-entity-models';

class Hero {
  id: number;
  name: string;
  saying?: string;
}

class TestStore  {
  dispatch = jasmine.createSpy('dispatch');

  get dispatchedAction() {
    return <EntityAction> this.dispatch.calls.argsFor(0)[0];
  }
}

const selectId = (entity: any) => entity.id;
describe('EntityDispatcher', () => {
  let dispatcher: EntityDispatcher<Hero>;
  let testStore: TestStore;

  beforeEach(() => {
    testStore = new TestStore();
    dispatcher = new EntityDispatcher('Hero', <any> testStore, selectId)
  });

  it('#add(hero) dispatches SAVE_ADD', () => {
    const hero: Hero = {id: 42, name: 'test'};
    dispatcher.add(hero);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.SAVE_ADD);
    expect(testStore.dispatchedAction.payload).toBe(hero);
  });

  it('#delete(42) dispatches SAVE_DELETE for the id:42', () => {
    dispatcher.delete(42);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.SAVE_DELETE);
    expect(testStore.dispatchedAction.payload).toBe(42);
  });

  it('#getAll() dispatches QUERY_ALL for the Hero collection', () => {
    dispatcher.getAll();

    expect(testStore.dispatchedAction.op).toBe(EntityOp.QUERY_ALL);
    expect(testStore.dispatchedAction.entityName).toBe('Hero');
  });

  it('#getByKey(42) dispatches QUERY_BY_KEY for the id:42', () => {
    dispatcher.getByKey(42);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.QUERY_BY_KEY);
    expect(testStore.dispatchedAction.payload).toBe(42);
  });

  it('#getWithQuery(QueryParams) dispatches QUERY_MANY', () => {
    dispatcher.getWithQuery({name: 'B'});

    expect(testStore.dispatchedAction.op).toBe(EntityOp.QUERY_MANY);
    expect(testStore.dispatchedAction.entityName).toBe('Hero');
    expect(testStore.dispatchedAction.payload).toEqual({name: 'B'}, 'params')
  });

  it('#getWithQuery(string) dispatches QUERY_MANY', () => {
    dispatcher.getWithQuery('name=B');

    expect(testStore.dispatchedAction.op).toBe(EntityOp.QUERY_MANY);
    expect(testStore.dispatchedAction.entityName).toBe('Hero');
    expect(testStore.dispatchedAction.payload).toEqual('name=B', 'params')
  });

  it('#update(hero) dispatches SAVE_UPDATE with an update payload', () => {
    const hero: Hero = {id: 42, name: 'test'}
    const expectedUpdate: Update<Hero> = { id: 42, changes: hero };

    dispatcher.update(hero);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.SAVE_UPDATE);
    expect(testStore.dispatchedAction.payload).toEqual(expectedUpdate);
  });

  /*** Cache-only operations ***/

  it('#addAllToCache dispatches ADD_ALL', () => {
    const heroes: Hero[] = [
      { id: 42, name: 'test 42' },
      { id: 84, name: 'test 84', saying: 'howdy' }
    ];
    dispatcher.addAllToCache(heroes);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.ADD_ALL);
    expect(testStore.dispatchedAction.payload).toBe(heroes);
  });

  it('#addOneToCache dispatches ADD_ONE', () => {
    const hero: Hero = { id: 42, name: 'test' };
    dispatcher.addOneToCache(hero);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.ADD_ONE);
    expect(testStore.dispatchedAction.payload).toBe(hero);
  });

  it('#addManyToCache dispatches ADD_MANY', () => {
    const heroes: Hero[] = [
      { id: 42, name: 'test 42' },
      { id: 84, name: 'test 84', saying: 'howdy' }
    ];
    dispatcher.addManyToCache(heroes);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.ADD_MANY);
    expect(testStore.dispatchedAction.payload).toBe(heroes);
  });

  it('#clear() dispatches REMOVE_ALL for the Hero collection', () => {
    dispatcher.clear();

    expect(testStore.dispatchedAction.op).toBe(EntityOp.REMOVE_ALL);
    expect(testStore.dispatchedAction.entityName).toBe('Hero');
  });

  it('#removeOneFromCache dispatches REMOVE_ONE', () => {
    const id = 42;
    dispatcher.removeOneFromCache(id);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.REMOVE_ONE);
    expect(testStore.dispatchedAction.payload).toBe(id);
  });

  it('#removeManyFromCache dispatches REMOVE_MANY', () => {
    const keys = [42, 84];
    dispatcher.removeManyFromCache(keys);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.REMOVE_MANY);
    expect(testStore.dispatchedAction.payload).toBe(keys);
  });

  it('#updateOneToCache dispatches update_ONE', () => {
    const hero: Partial<Hero> = { id: 42, name: 'test' };
    const update = { id: 42, changes: hero };
    dispatcher.updateOneInCache(hero);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.UPDATE_ONE);
    expect(testStore.dispatchedAction.payload).toEqual(update);
  });

  it('#updateManyToCache dispatches update_MANY', () => {
    const heroes: Partial<Hero>[] = [
      { id: 42, name: 'test 42' },
      { id: 84, saying: 'ho ho ho' }
    ];
    const updates = [
      { id: 42, changes: heroes[0] },
      { id: 84, changes: heroes[1] }
    ];
    dispatcher.updateManyInCache(heroes);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.UPDATE_MANY);
    expect(testStore.dispatchedAction.payload).toEqual(updates);
  });
});
