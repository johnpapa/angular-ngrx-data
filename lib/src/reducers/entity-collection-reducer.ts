import { Injectable } from '@angular/core';

import { EntityAction } from '../actions/entity-action';
import { EntityCollection } from './entity-collection';

export type EntityCollectionReducer<T = any> = (collection: EntityCollection<T>, action: EntityAction) => EntityCollection<T>;

/**
 * Map of {EntityOp} to reducer method for the operation.
 * If an operation is missing, caller should return the collection for that reducer.
 */
export interface EntityCollectionReducerMethods<T> {
  [method: string]: (collection: EntityCollection<T>, action?: EntityAction) => EntityCollection<T>;
}

/**
 * Creates {EntityCollectionReducerMethods} for a given entity type.
 * See {DefaultEntityCollectionReducerMethodsFactory}.
 */
export abstract class EntityCollectionReducerMethodsFactory {
  abstract create<T>(entityName: string): EntityCollectionReducerMethods<T>;
}

/** Create a default reducer for a specific entity collection */
@Injectable()
export class EntityCollectionReducerFactory {
  constructor(private methodsFactory: EntityCollectionReducerMethodsFactory) {}

  /** Create a default reducer for a collection of entities of T */
  create<T = any>(entityName: string): EntityCollectionReducer<T> {
    const methods = this.methodsFactory.create<T>(entityName);

    /** Perform Actions against a particular entity collection in the EntityCache */
    return function entityCollectionReducer(collection: EntityCollection<T>, action: EntityAction): EntityCollection<T> {
      const reducerMethod = methods[action.payload.entityOp];
      return reducerMethod ? reducerMethod(collection, action) : collection;
    };
  }
}
