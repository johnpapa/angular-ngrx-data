import { Store } from '@ngrx/store';

import { EntityDispatcher } from './entity-dispatcher';

import { EntityAction, EntityOp } from './entity.actions';
import { Update } from './ngrx-entity-models';

class Hero {
  id: number;
  name: string;
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

  it('#clear() dispatches REMOVE_ALL for the Hero collection', () => {
    dispatcher.clear();

    expect(testStore.dispatchedAction.op).toBe(EntityOp.REMOVE_ALL);
    expect(testStore.dispatchedAction.entityName).toBe('Hero');
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

  it('#update(hero) dispatches SAVE_UPDATE with an update payload', () => {
    const hero: Hero = {id: 42, name: 'test'}
    const expectedUpdate: Update<Hero> = { id: 42, changes: hero };

    dispatcher.update(hero);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.SAVE_UPDATE);
    expect(testStore.dispatchedAction.payload).toEqual(expectedUpdate);
  });
});
