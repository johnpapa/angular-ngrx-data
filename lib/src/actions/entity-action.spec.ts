import { Action } from '@ngrx/store';

import { EntityAction, EntityActionFactory } from './entity-action';
import { EntityOp } from './entity-op';

class Hero {
  id: number;
  name: string;
}

describe('EntityActionFactory', () => {

  let factory: EntityActionFactory

  beforeEach(() => {
    factory = new EntityActionFactory();
  });

  it('should create expected EntityAction for named entity', () => {
    const hero: Hero = {id: 42, name: 'Francis' };
    const action = factory.create('Hero', EntityOp.ADD_ONE, hero);
    expect(action.entityName).toBe('Hero');
    expect(action.op).toBe(EntityOp.ADD_ONE);
    expect(action.payload).toBe(hero);
  });

  it('should create EntityAction from another EntityAction', () => {
    const hero: Hero = {id: 42, name: 'Francis' };
    const action1 = factory.create('Hero', EntityOp.ADD_ONE, hero);
    const action = factory.create(action1, EntityOp.SAVE_ADD_ONE)
    expect(action.entityName).toBe('Hero');
    expect(action.op).toBe(EntityOp.SAVE_ADD_ONE);
    // Forward's the payload to the new action.
    expect(action.payload).toBe(hero);
  });

  it('can suppress the payload when create EntityAction from another EntityAction', () => {
    const hero: Hero = {id: 42, name: 'Francis' };
    const action1 = factory.create('Hero', EntityOp.ADD_ONE, hero);
    const action = factory.create(action1, EntityOp.SAVE_ADD_ONE, undefined)
    expect(action.entityName).toBe('Hero');
    expect(action.op).toBe(EntityOp.SAVE_ADD_ONE);
    expect(action.payload).toBeUndefined();
  });

  it('should format type as expected with #formatActionTypeName()', () => {
    const action = factory.create('Hero', EntityOp.QUERY_ALL);
    const expectedFormat = factory.formatActionType(EntityOp.QUERY_ALL, 'Hero');
    expect(action.type).toBe(expectedFormat);
  });

  it('can re-format generated action.type with custom #formatActionType()', () => {
    factory.formatActionType = (op, entityName) => `${entityName}_${op}`.toUpperCase();

    const expected = ('Hero_' + EntityOp.QUERY_ALL).toUpperCase();
    const action = factory.create('Hero', EntityOp.QUERY_ALL);
    expect(action.type).toBe(expected);
  });

  it('should throw if do not specify entity name', () => {
    expect(() => factory.create(null)).toThrow();
  });

  it('should throw if do not specify EntityOp', () => {
    expect(() => factory.create('Hero')).toThrow();
  });
});
