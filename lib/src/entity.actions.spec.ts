import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { flattenArgs } from './interfaces';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Operator } from 'rxjs/Operator';
import { filter, share, takeUntil } from 'rxjs/operators';

import { EntityAction, EntityActions, EntityOp } from './entity.actions';

class Hero {
  id: number;
  name: string;
}

describe('EntityAction', () => {

  it('should create expected EntityAction for named entity', () => {
    const hero: Hero = {id: 42, name: 'Francis' };
    const action = new EntityAction('Hero', EntityOp.ADD_ONE, hero);
    expect(action.entityName).toBe('Hero');
    expect(action.op).toBe(EntityOp.ADD_ONE);
    expect(action.payload).toBe(hero);
  });

  it('should create EntityAction from another EntityAction', () => {
    const hero: Hero = {id: 42, name: 'Francis' };
    const action1 = new EntityAction('Hero', EntityOp.ADD_ONE, hero);
    const action = new EntityAction(action1, EntityOp.SAVE_ADD)
    expect(action.entityName).toBe('Hero');
    expect(action.op).toBe(EntityOp.SAVE_ADD);
    // Forward's the payload to the new action.
    expect(action.payload).toBe(hero);
  });

  it('can suppress the payload when create EntityAction from another EntityAction', () => {
    const hero: Hero = {id: 42, name: 'Francis' };
    const action1 = new EntityAction('Hero', EntityOp.ADD_ONE, hero);
    const action = new EntityAction(action1, EntityOp.SAVE_ADD, undefined)
    expect(action.entityName).toBe('Hero');
    expect(action.op).toBe(EntityOp.SAVE_ADD);
    expect(action.payload).toBeUndefined();
  });
  it('should format type as expected with #formatActionTypeName()', () => {
    const action = new EntityAction('Hero', EntityOp.QUERY_ALL);
    const expectedFormat = EntityAction.formatActionType(EntityOp.QUERY_ALL, 'Hero');
    expect(action.type).toBe(expectedFormat);
  });

  it('should throw if do not specify entity name', () => {
    expect(() => new EntityAction(null)).toThrow();
  });

  it('should throw if do not specify EntityOp', () => {
    expect(() => new EntityAction('Hero')).toThrow();
  });
});

// Todo: consider marble testing
describe('EntityActions', () => {

  let eas: EntityActions;
  let results: any[];
  let source: Subject<Action>;

  const testActions = {
    foo: <Action> {type: 'Foo'},
    hero_query_all: new EntityAction('Hero', EntityOp.QUERY_ALL),
    villain_query_many: new EntityAction('Villain', EntityOp.QUERY_MANY),
    hero_delete: new EntityAction('Hero', EntityOp.SAVE_DELETE, 42),
    bar: <Action> <any> {type: 'Bar', payload: 'bar'},
  };

  function dispatchTestActions() {
    Object.keys(testActions).forEach(
      a => source.next((<any> testActions)[a])
    );
  }

  beforeEach(() => {
    source = new Subject<Action>();
    const actions = new Actions(source);
    eas = new EntityActions(actions);
    results = [];
  });

  it('#filter', () => {
    // Filter for the 'Hero' EntityAction with a payload
    eas.filter(ea => ea.entityName === 'Hero' && ea.payload != null)
      .subscribe(ea => results.push(ea));

    // This is it
    const expectedActions = [testActions.hero_delete];
    dispatchTestActions();
    expect(results).toEqual(expectedActions);
  });

  ///////////////

  it('#ofEntityType()', () => {
    // EntityActions of any kind
    eas.ofEntityType().subscribe(ea => results.push(ea));

    const expectedActions = [
      testActions.hero_query_all,
      testActions.villain_query_many,
      testActions.hero_delete,
    ];
    dispatchTestActions();
    expect(results).toEqual(expectedActions);
  });

  it('#ofEntityType(\'SomeType\')', () => {
    // EntityActions of one type
    eas.ofEntityType('Hero').subscribe(ea => results.push(ea));

    const expectedActions = [
      testActions.hero_query_all,
      testActions.hero_delete,
    ];
    dispatchTestActions();
    expect(results).toEqual(expectedActions);
  });

  it('#ofEntityType(\'Type1\', \'Type2\', \'Type3\')', () => {
    // n.b. 'Bar' is not an EntityType even though it is an action type
    eas.ofEntityType('Hero', 'Villain', 'Bar')
    .subscribe(ea => results.push(ea));

    ofEntityTypesTest();
  });

  it('#ofEntityType(...arrayOfTypeNames)', () => {    const types = ['Hero', 'Villain', 'Bar'];

    eas.ofEntityType(...types).subscribe(ea => results.push(ea));
    ofEntityTypesTest();
  });

  it('#ofEntityType(arrayOfTypeNames)', () => {    const types = ['Hero', 'Villain', 'Bar'];

    eas.ofEntityType(types).subscribe(ea => results.push(ea));
    ofEntityTypesTest();
  });

  function ofEntityTypesTest() {
    const expectedActions = [
      testActions.hero_query_all,
      testActions.villain_query_many,
      testActions.hero_delete,
      // testActions.bar, // 'Bar' is not an EntityType
    ];
    dispatchTestActions();
    expect(results).toEqual(expectedActions);
  }

  it('#ofEntityType(...) is case sensitive', () => {
    // EntityActions of the 'hero' type, but it's lowercase so shouldn't match
    eas.ofEntityType('hero').subscribe(ea => results.push(ea));

    dispatchTestActions();
    expect(results).toEqual([], 'should not match anything');
  });

  ///////////////

  it('#ofOp with string args', () => {
    eas.ofOp(EntityOp.QUERY_ALL, EntityOp.QUERY_MANY)
    .subscribe(ea => results.push(ea));

    ofOpTest();
  });

  it('#ofOp with ...rest args', () => {    const ops = [EntityOp.QUERY_ALL, EntityOp.QUERY_MANY];

    eas.ofOp(...ops).subscribe(ea => results.push(ea));
    ofOpTest();
  });

  it('#ofOp with array args', () => {    const ops = [EntityOp.QUERY_ALL, EntityOp.QUERY_MANY];

    eas.ofOp(ops).subscribe(ea => results.push(ea));
    ofOpTest();
  });

  function ofOpTest() {
    const expectedActions = [
      testActions.hero_query_all,
      testActions.villain_query_many,
    ];
    dispatchTestActions();
    expect(results).toEqual(expectedActions);
  }

  ///////////////

  it('#ofType with string args', () => {
    eas.ofType('QUERY_ALL [HERO]', 'QUERY_MANY [VILLAIN]')
    .subscribe(ea => results.push(ea));

    ofTypeTest();
  });

  it('#ofType with ...rest args', () => {    const types = ['QUERY_ALL [HERO]', 'QUERY_MANY [VILLAIN]'];

    eas.ofType(...types).subscribe(ea => results.push(ea));
    ofTypeTest();
  });

  it('#ofType with array args', () => {    const types = ['QUERY_ALL [HERO]', 'QUERY_MANY [VILLAIN]'];

    eas.ofType(types).subscribe(ea => results.push(ea));
    ofTypeTest();
  });

  function ofTypeTest() {
    const expectedActions = [
      testActions.hero_query_all,
      testActions.villain_query_many,
    ];
    dispatchTestActions();
    expect(results).toEqual(expectedActions);
  }

  ///////////////

  it('#until(notifier) completes the subscriber', () => {    const stop = new Subject();
    let completed = 0;

    const actions = eas
      .ofEntityType()
      .until(stop); // completes and unsubscribes

    actions.subscribe(null, null, () => completed++);
    actions.subscribe(ea => results.push(ea), null, () => completed++);

    const action = new EntityAction('Hero', EntityOp.SAVE_DELETE, 42)

    source.next(action);
    source.next(action);
    source.next(action);
    stop.next();

    // The following should be ignored.
    source.next(action);
    source.next(action);

    expect(results.length).toBe(3, 'should have 3 results');
    expect(completed).toBe(2, 'should have completed both subscriptions');
  });

});
