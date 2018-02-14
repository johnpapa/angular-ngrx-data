import { EntityAction, EntityActionFactory, EntityOp } from './entity.actions';
import { EntityDispatcher, EntityDispatcherFactory } from './entity-dispatcher';
import { EntityCommands } from './entity-commands';
import { Update } from './ngrx-entity-models';

class Hero {
  id: number;
  name: string;
  saying?: string;
}

describe('EntityDispatcher', () => {

  commandDispatchTest(entityDispatcherTestSetup);

  function entityDispatcherTestSetup() {
    // only interested in calls to store.dispatch()
    const testStore = jasmine.createSpyObj('store', ['dispatch']);

    const selectId = (entity: any) => entity.id;
    const entityActionFactory = new EntityActionFactory();
    const dispatcher = new EntityDispatcher('Hero', entityActionFactory, testStore, selectId)
    return { dispatcher, testStore };
  }
});

///// Tests /////

/** Test that implementer of EntityCommands dispatches properly */
export function commandDispatchTest(
  setup: () => { dispatcher: EntityDispatcher<Hero>, testStore: any}
 ) {

  let dispatcher: EntityDispatcher<Hero>;
  let testStore: { dispatch: jasmine.Spy };

  function dispatchedAction() {
    return <EntityAction> testStore.dispatch.calls.argsFor(0)[0];
  }

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

    expect(dispatchedAction().op).toBe(EntityOp.SAVE_ADD);
    expect(dispatchedAction().payload).toBe(hero);
  });

  it('#delete(42) dispatches SAVE_DELETE for the id:42', () => {
    dispatcher.delete(42);

    expect(dispatchedAction().op).toBe(EntityOp.SAVE_DELETE);
    expect(dispatchedAction().payload).toBe(42);
  });

  it('#delete(hero) dispatches SAVE_DELETE for the hero.id', () => {
    const id = 42;
    const hero: Hero = {id, name: 'test'};

    dispatcher.delete(hero);

    expect(dispatchedAction().op).toBe(EntityOp.SAVE_DELETE);
    expect(dispatchedAction().payload).toBe(id);
  });

  it('#getAll() dispatches QUERY_ALL for the Hero collection', () => {
    dispatcher.getAll();

    expect(dispatchedAction().op).toBe(EntityOp.QUERY_ALL);
    expect(dispatchedAction().entityName).toBe('Hero');
  });

  it('#getByKey(42) dispatches QUERY_BY_KEY for the id:42', () => {
    dispatcher.getByKey(42);

    expect(dispatchedAction().op).toBe(EntityOp.QUERY_BY_KEY);
    expect(dispatchedAction().payload).toBe(42);
  });

  it('#getWithQuery(QueryParams) dispatches QUERY_MANY', () => {
    dispatcher.getWithQuery({name: 'B'});

    expect(dispatchedAction().op).toBe(EntityOp.QUERY_MANY);
    expect(dispatchedAction().entityName).toBe('Hero');
    expect(dispatchedAction().payload).toEqual({name: 'B'}, 'params')
  });

  it('#getWithQuery(string) dispatches QUERY_MANY', () => {
    dispatcher.getWithQuery('name=B');

    expect(dispatchedAction().op).toBe(EntityOp.QUERY_MANY);
    expect(dispatchedAction().entityName).toBe('Hero');
    expect(dispatchedAction().payload).toEqual('name=B', 'params')
  });

  it('#update(hero) dispatches SAVE_UPDATE with an update payload', () => {
    const hero: Hero = {id: 42, name: 'test'}
    const expectedUpdate: Update<Hero> = { id: 42, changes: hero };

    dispatcher.update(hero);

    expect(dispatchedAction().op).toBe(EntityOp.SAVE_UPDATE);
    expect(dispatchedAction().payload).toEqual(expectedUpdate);
  });

  /*** Cache-only operations ***/

  it('#addAllToCache dispatches ADD_ALL', () => {
    const heroes: Hero[] = [
      { id: 42, name: 'test 42' },
      { id: 84, name: 'test 84', saying: 'howdy' }
    ];
    dispatcher.addAllToCache(heroes);

    expect(dispatchedAction().op).toBe(EntityOp.ADD_ALL);
    expect(dispatchedAction().payload).toBe(heroes);
  });

  it('#addOneToCache dispatches ADD_ONE', () => {
    const hero: Hero = { id: 42, name: 'test' };
    dispatcher.addOneToCache(hero);

    expect(dispatchedAction().op).toBe(EntityOp.ADD_ONE);
    expect(dispatchedAction().payload).toBe(hero);
  });

  it('#addManyToCache dispatches ADD_MANY', () => {
    const heroes: Hero[] = [
      { id: 42, name: 'test 42' },
      { id: 84, name: 'test 84', saying: 'howdy' }
    ];
    dispatcher.addManyToCache(heroes);

    expect(dispatchedAction().op).toBe(EntityOp.ADD_MANY);
    expect(dispatchedAction().payload).toBe(heroes);
  });

  it('#clearCache() dispatches REMOVE_ALL for the Hero collection', () => {
    dispatcher.clearCache();

    expect(dispatchedAction().op).toBe(EntityOp.REMOVE_ALL);
    expect(dispatchedAction().entityName).toBe('Hero');
  });

  it('#removeOneFromCache(key) dispatches REMOVE_ONE', () => {
    const id = 42;
    dispatcher.removeOneFromCache(id);

    expect(dispatchedAction().op).toBe(EntityOp.REMOVE_ONE);
    expect(dispatchedAction().payload).toBe(id);
  });

  it('#removeOneFromCache(entity) dispatches REMOVE_ONE', () => {
    const id = 42;
    const hero: Hero = {id, name: 'test'};
    dispatcher.removeOneFromCache(hero);

    expect(dispatchedAction().op).toBe(EntityOp.REMOVE_ONE);
    expect(dispatchedAction().payload).toBe(id);
  });

  it('#removeManyFromCache(keys) dispatches REMOVE_MANY', () => {
    const keys = [42, 84];
    dispatcher.removeManyFromCache(keys);

    expect(dispatchedAction().op).toBe(EntityOp.REMOVE_MANY);
    expect(dispatchedAction().payload).toBe(keys);
  });

  it('#removeManyFromCache(entities) dispatches REMOVE_MANY', () => {
    const heroes: Hero[] = [
      { id: 42, name: 'test 42' },
      { id: 84, name: 'test 84', saying: 'howdy' }
    ];
    const keys = heroes.map(h => h.id);
    dispatcher.removeManyFromCache(heroes);

    expect(dispatchedAction().op).toBe(EntityOp.REMOVE_MANY);
    expect(dispatchedAction().payload).toEqual(keys);
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

    expect(dispatchedAction().op).toBe(EntityOp.UPDATE_ONE);
    expect(dispatchedAction().payload).toEqual(update);
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

    expect(dispatchedAction().op).toBe(EntityOp.UPDATE_MANY);
    expect(dispatchedAction().payload).toEqual(updates);
  });

  it('#upsertOneInCache dispatches UPSERT_ONE', () => {
    const hero: Partial<Hero> = { id: 42, name: 'test' };
    const upsert = { id: 42, changes: hero };
    dispatcher.upsertOneInCache(hero);

    expect(dispatchedAction().op).toBe(EntityOp.UPSERT_ONE);
    expect(dispatchedAction().payload).toEqual(upsert);
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

    expect(dispatchedAction().op).toBe(EntityOp.UPSERT_MANY);
    expect(dispatchedAction().payload).toEqual(upserts);
  });
}
