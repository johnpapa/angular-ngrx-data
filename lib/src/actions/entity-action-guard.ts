import { EntityAction } from './entity-action';
import { IdSelector, Update } from '../utils';

export class EntityActionGuard {
  constructor(private selectId: IdSelector<any>) {}

  /** Throw if the action payload is not an entity with a valid key */
  mustBeEntity(action: EntityAction) {
    const { entityName, payload, op, type } = action;
    if (!payload) {
      this.makeError(action, `should have a single entity.`);
    }
    const id = this.selectId(payload);
    if (this.isNotKeyType(id)) {
      this.makeError(action, `has a missing or invalid entity key (id)`);
    }
  }

  /** Throw if the action payload is not an array of entities with valid keys */
  mustBeEntities(action: EntityAction<any[]>) {
    const { entityName, payload, op, type } = action;
    if (!Array.isArray(payload)) {
      this.makeError(action, `should be an array of entities`);
    }
    payload.forEach((entity, i) => {
      const id = this.selectId(entity);
      if (this.isNotKeyType(id)) {
        const msg = `, item ${i + 1}, does not have a valid entity key (id)`;
        this.makeError(action, msg);
      }
    });
  }

  /** Throw if the action payload is not a single, valid key */
  mustBeKey(action: EntityAction<string | number>) {
    const { entityName, payload, op, type } = action;
    if (!payload) {
      throw new Error(`should be a single entity key`);
    }
    if (this.isNotKeyType(payload)) {
      throw new Error(`is not a valid key (id)`);
    }
  }

  /** Throw if the action payload is not an array of valid keys */
  mustBeKeys(action: EntityAction<(string | number)[]>) {
    const { entityName, payload, op, type } = action;
    if (!Array.isArray(payload)) {
      this.makeError(action, `should be an array of entity keys (id)`);
    }
    payload.forEach((id, i) => {
      if (this.isNotKeyType(id)) {
        const msg = `${entityName} ', item ${i +
          1}, is not a valid entity key (id)`;
        this.makeError(action, msg);
      }
    });
  }

  /** Throw if the action payload is not an update with a valid key (id) */
  mustBeUpdate(action: EntityAction<Update<any>>) {
    const { entityName, payload, op, type } = action;
    if (!payload) {
      this.makeError(action, `should be a single entity update`);
    }
    const { id, changes } = payload;
    const id2 = this.selectId(changes);
    if (this.isNotKeyType(id) || this.isNotKeyType(id2)) {
      this.makeError(action, `has a missing or invalid entity key (id)`);
    }
  }

  /** Throw if the action payload is not an array of updates with valid keys (ids) */
  mustBeUpdates(action: EntityAction<Update<any>[]>) {
    const { entityName, payload, op, type } = action;
    if (!Array.isArray(payload)) {
      this.makeError(action, `should be an array of entity updates`);
    }
    payload.forEach((item, i) => {
      const { id, changes } = item;
      const id2 = this.selectId(changes);
      if (this.isNotKeyType(id) || this.isNotKeyType(id2)) {
        this.makeError(
          action,
          `, item ${i + 1}, has a missing or invalid entity key (id)`
        );
      }
    });
  }

  /** Return true if this key (id) is invalid */
  isNotKeyType(id: any) {
    return typeof id !== 'string' && typeof id !== 'number';
  }

  makeError(action: EntityAction, msg: string) {
    throw new Error(`Action "${action.type}" payload ${msg}`);
  }
}
