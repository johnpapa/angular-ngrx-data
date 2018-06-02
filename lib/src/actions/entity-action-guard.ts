import { EntityAction } from './entity-action';
import { IdSelector, Update } from '../utils/ngrx-entity-models';

/**
 * Guard methods that ensure EntityAction payload is as expected.
 * Each method returns that payload if it passes the guard or
 * throws an error.
 */
export class EntityActionGuard {
  constructor(private selectId: IdSelector<any>) {}

  /** Throw if the action payload is not an entity with a valid key */
  mustBeEntity<T = any>(action: EntityAction): T {
    const { entityName, payload, op, type } = action;
    if (!payload) {
      this.throwError(action, `should have a single entity.`);
    }
    const id = this.selectId(payload);
    if (this.isNotKeyType(id)) {
      this.throwError(action, `has a missing or invalid entity key (id)`);
    }
    return payload as T;
  }

  /** Throw if the action payload is not an array of entities with valid keys */
  mustBeEntities<T = any>(action: EntityAction<any[]>): T[] {
    const { entityName, payload, op, type } = action;
    if (!Array.isArray(payload)) {
      this.throwError(action, `should be an array of entities`);
    }
    payload.forEach((entity, i) => {
      const id = this.selectId(entity);
      if (this.isNotKeyType(id)) {
        const msg = `, item ${i + 1}, does not have a valid entity key (id)`;
        this.throwError(action, msg);
      }
    });
    return payload;
  }

  /** Throw if the action payload is not a single, valid key */
  mustBeKey(action: EntityAction<string | number>): string | number {
    const { entityName, payload, op, type } = action;
    if (!payload) {
      throw new Error(`should be a single entity key`);
    }
    if (this.isNotKeyType(payload)) {
      throw new Error(`is not a valid key (id)`);
    }
    return payload;
  }

  /** Throw if the action payload is not an array of valid keys */
  mustBeKeys(action: EntityAction<(string | number)[]>): (string | number)[] {
    const { entityName, payload, op, type } = action;
    if (!Array.isArray(payload)) {
      this.throwError(action, `should be an array of entity keys (id)`);
    }
    payload.forEach((id, i) => {
      if (this.isNotKeyType(id)) {
        const msg = `${entityName} ', item ${i + 1}, is not a valid entity key (id)`;
        this.throwError(action, msg);
      }
    });
    return payload;
  }

  /** Throw if the action payload is not an update with a valid key (id) */
  mustBeUpdate<T = any>(action: EntityAction<Update<T>>): Update<T> {
    const { entityName, payload, op, type } = action;
    if (!payload) {
      this.throwError(action, `should be a single entity update`);
    }
    const { id, changes } = payload;
    const id2 = this.selectId(changes);
    if (this.isNotKeyType(id) || this.isNotKeyType(id2)) {
      this.throwError(action, `has a missing or invalid entity key (id)`);
    }
    return payload;
  }

  /** Throw if the action payload is not an array of updates with valid keys (ids) */
  mustBeUpdates<T = any>(action: EntityAction<Update<any>[]>): Update<T>[] {
    const { entityName, payload, op, type } = action;
    if (!Array.isArray(payload)) {
      this.throwError(action, `should be an array of entity updates`);
    }
    payload.forEach((item, i) => {
      const { id, changes } = item;
      const id2 = this.selectId(changes);
      if (this.isNotKeyType(id) || this.isNotKeyType(id2)) {
        this.throwError(action, `, item ${i + 1}, has a missing or invalid entity key (id)`);
      }
    });
    return payload;
  }

  /** Return true if this key (id) is invalid */
  private isNotKeyType(id: any) {
    return typeof id !== 'string' && typeof id !== 'number';
  }

  private throwError(action: EntityAction, msg: string): void {
    throw new Error(`EntityAction guard for "${action.type}": payload ${msg}`);
  }
}
