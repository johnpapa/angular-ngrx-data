import { EntityAction } from './entity-action';
import { IdSelector, Update } from '../utils';

export class EntityActionGuard<T> {
  constructor(
    private entityName: string,
    private selectId: IdSelector<T>
  ) { }

  mustBeOne(changes: any[], entityOp: string, exactlyOne: boolean) {
    if (exactlyOne && changes.length !== 1) {
      const errorMsg = `${entityOp} payload should be one ${this.entityName}.`;
      throw new Error(errorMsg);
    }
  }

  mustBeEntities(entities: T[], entityOp: string, exactlyOne = false) {
    this.mustBeOne(entities, entityOp, exactlyOne);
    entities.forEach((entity, i) => {
      const id = this.selectId(entity);
      if (id == null) {
        const reason = 'is not an entity with a valid key (id)'
        this.onError(entities, i, entityOp, reason);
      }
    })
  }

  mustBeIds(ids: number | string | (number | string)[], entityOp: string, exactlyOne = false) {
    const changes = Array.isArray(ids) ? ids : [ids];
    this.mustBeOne(changes, entityOp, exactlyOne);
    changes.forEach((id, i) => {
      if (typeof id === 'number' || typeof id === 'string') { return; }
      const reason = 'is not a valid primary key (id)'
      this.onError(changes, i, entityOp, reason);
    })
  }

  mustBeUpdates(updates: Update<T>[], entityOp: string, exactlyOne = false) {
    const changes = Array.isArray(updates) ? updates : [updates];
    this.mustBeOne(changes, entityOp, exactlyOne);
    changes.forEach((up, i) => {
      // An Update<T> has `id` and `changes` properties
      if (up.id == null || up.changes == null) {
        const reason = `is not an Update<${this.entityName}> with a valid id`
        this.onError(changes, i, entityOp, reason);
      }
    });
  }

  private onError(changes: any[], index: number, entityOp: string, reason: string) {
    const itemMsg = changes.length > 1 ? `Item ${index} in ` : ''
    const errorMsg = `${itemMsg}${this.entityName} ${entityOp} payload ${reason}.`;
    throw new Error(errorMsg);
  }
}
