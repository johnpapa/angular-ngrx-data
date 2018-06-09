import { Action } from '@ngrx/store';

import { EntityAction } from './entity-action';
import { EntityActionFactory } from './entity-action-factory';
import { EntityOp } from './entity-op';

class Hero {
  id: number;
  name: string;
}

describe('EntityActionFactory', () => {
  let factory: EntityActionFactory;

  beforeEach(() => {
    factory = new EntityActionFactory();
  });

  it('should create expected EntityAction for named entity', () => {
    const hero: Hero = { id: 42, name: 'Francis' };
    const action = factory.create('Hero', EntityOp.ADD_ONE, hero);
    const { entityName, op, data } = action.payload;
    expect(entityName).toBe('Hero');
    expect(op).toBe(EntityOp.ADD_ONE);
    expect(data).toBe(hero);
  });

  it('should create EntityAction from another EntityAction', () => {
    const hero: Hero = { id: 42, name: 'Francis' };
    const action1 = factory.create('Hero', EntityOp.ADD_ONE, hero);
    const action = factory.createFromAction(action1, { op: EntityOp.SAVE_ADD_ONE });
    const { entityName, op, data } = action.payload;
    expect(entityName).toBe('Hero');
    expect(op).toBe(EntityOp.SAVE_ADD_ONE);
    // Data from source action forwarded to the new action.
    expect(data).toBe(hero);
  });

  it('can suppress the payload when create EntityAction from another EntityAction', () => {
    const hero: Hero = { id: 42, name: 'Francis' };
    const action1 = factory.create('Hero', EntityOp.ADD_ONE, hero);
    const action = factory.createFromAction(action1, { op: EntityOp.SAVE_ADD_ONE, data: undefined });
    const { entityName, op, data } = action.payload;
    expect(entityName).toBe('Hero');
    expect(op).toBe(EntityOp.SAVE_ADD_ONE);
    expect(data).toBeUndefined();
  });

  it('should format type as expected with #formatActionTypeName()', () => {
    const action = factory.create('Hero', EntityOp.QUERY_ALL);
    const expectedFormat = factory.formatActionType(EntityOp.QUERY_ALL, 'Hero');
    expect(action.type).toBe(expectedFormat);
  });

  it('should format type with given tag instead of the entity name', () => {
    const tag = 'Hero - Tag Test';
    const action = factory.create('Hero', EntityOp.QUERY_ALL, null, { tag });
    expect(action.type).toContain(tag);
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
    expect(() => factory.create({ entityName: 'Hero', op: null })).toThrow();
  });
});
