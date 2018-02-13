import { EntityAction, EntityActionFactory, EntityOp } from './entity.actions';
import { EntityDispatcher, EntityDispatcherFactory } from './entity-dispatcher';
import { EntityCommands } from './entity-commands';
import { Update } from './ngrx-entity-models';

// region test helpers
///// test helpers /////

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
// endregion test helpers

describe('EntityDispatcher', () => {

  commandDispatchTest(entityDispatcherTestSetup);

  function entityDispatcherTestSetup() {
    const selectId = (entity: any) => entity.id;
    const testStore = new TestStore();
    const entityActionFactory = new EntityActionFactory();
    const dispatcher = new EntityDispatcher('Hero', entityActionFactory, <any> testStore, selectId)
    return { dispatcher, testStore };
  }
});

///// Tests /////

/** Test that implementer of EntityCommands dispatches properly */
export function commandDispatchTest(
  setup: () => { dispatcher: EntityDispatcher<Hero>, testStore: TestStore}
 ) {

  let dispatcher: EntityDispatcher<Hero>;
  let testStore: TestStore;

  beforeEach(() => {
    const s = setup();
    dispatcher = s.dispatcher;
    testStore = s.testStore;
  });

  it('#entityName is the expected name of the entity type', () => {
    expect(dispatcher.entityName).toBe('Hero')
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

  it('#delete(hero) dispatches SAVE_DELETE for the hero.id', () => {
    const id = 42;
    const hero: Hero = {id, name: 'test'};

    dispatcher.delete(hero);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.SAVE_DELETE);
    expect(testStore.dispatchedAction.payload).toBe(id);
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

  it('#clearCache() dispatches REMOVE_ALL for the Hero collection', () => {
    dispatcher.clearCache();

    expect(testStore.dispatchedAction.op).toBe(EntityOp.REMOVE_ALL);
    expect(testStore.dispatchedAction.entityName).toBe('Hero');
  });

  it('#removeOneFromCache(key) dispatches REMOVE_ONE', () => {
    const id = 42;
    dispatcher.removeOneFromCache(id);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.REMOVE_ONE);
    expect(testStore.dispatchedAction.payload).toBe(id);
  });

  it('#removeOneFromCache(entity) dispatches REMOVE_ONE', () => {
    const id = 42;
    const hero: Hero = {id, name: 'test'};
    dispatcher.removeOneFromCache(hero);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.REMOVE_ONE);
    expect(testStore.dispatchedAction.payload).toBe(id);
  });

  it('#removeManyFromCache(keys) dispatches REMOVE_MANY', () => {
    const keys = [42, 84];
    dispatcher.removeManyFromCache(keys);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.REMOVE_MANY);
    expect(testStore.dispatchedAction.payload).toBe(keys);
  });

  it('#removeManyFromCache(entities) dispatches REMOVE_MANY', () => {
    const heroes: Hero[] = [
      { id: 42, name: 'test 42' },
      { id: 84, name: 'test 84', saying: 'howdy' }
    ];
    const keys = heroes.map(h => h.id);
    dispatcher.removeManyFromCache(heroes);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.REMOVE_MANY);
    expect(testStore.dispatchedAction.payload).toEqual(keys);
  });

  it('#toUpdate() helper method creates Update<T>', () => {
    const hero: Partial<Hero> = { id: 42, name: 'test' };
    const expected = { id: 42, changes: hero };
    const update = dispatcher.toUpdate(hero);
    expect(update).toEqual(expected);
  });

  it('#updateOneInCache dispatches UPDATE_ONE', () => {
    const hero: Partial<Hero> = { id: 42, name: 'test' };
    const update = { id: 42, changes: hero };
    dispatcher.updateOneInCache(hero);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.UPDATE_ONE);
    expect(testStore.dispatchedAction.payload).toEqual(update);
  });

  it('#updateManyInCache dispatches UPDATE_MANY', () => {
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

  it('#upsertOneInCache dispatches UPSERT_ONE', () => {
    const hero: Partial<Hero> = { id: 42, name: 'test' };
    const upsert = { id: 42, changes: hero };
    dispatcher.upsertOneInCache(hero);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.UPSERT_ONE);
    expect(testStore.dispatchedAction.payload).toEqual(upsert);
  });

  it('#upsertManyInCache dispatches UPSERT_MANY', () => {
    const heroes: Partial<Hero>[] = [
      { id: 42, name: 'test 42' },
      { id: 84, saying: 'ho ho ho' }
    ];
    const upserts = [
      { id: 42, changes: heroes[0] },
      { id: 84, changes: heroes[1] }
    ];
    dispatcher.upsertManyInCache(heroes);

    expect(testStore.dispatchedAction.op).toBe(EntityOp.UPSERT_MANY);
    expect(testStore.dispatchedAction.payload).toEqual(upserts);
  });
}
