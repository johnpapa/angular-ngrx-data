import { IdSelector, Update } from './ngrx-entity-models';

/**
 * Flatten first arg if it is an array
 * Allows fn with ...rest signature to be called with an array instead of spread
 * Example:
 * ```
 * // EntityActions.ofOp
 * const persistOps = [EntityOp.QUERY_ALL, EntityOp.ADD, ...];
 * ofOp(...persistOps) // works
 * ofOp(persistOps) // also works
 * ```
 * */
export function flattenArgs<T>(args?: any[]): T[] {
  if (args == null) { return []; }
  if (Array.isArray(args[0])) {
    const [head, ...tail] = args;
    args = [...head, ...tail];
  }
  return args;
}

/**
 * Return a function that converts an entity (or partial entity) into the `Update<T>`
 * whose `id` is the primary key and
 * `changes` is the entity (or partial entity of changes).
 */
export function toUpdateFactory<T>(selectId?: IdSelector<T>) {
  selectId = selectId || ((e: any) => e.id);
  /**
   * Convert an entity (or partial entity) into the `Update<T>`
   * whose `id` is the primary key and
   * `changes` is the entity (or partial entity of changes).
   * @param selectId function that returns the entity's primary key (id)
   */
  return function toUpdate(entity: Partial<T>): Update<T> {
    return entity && { id: selectId(entity) as any, changes: entity } ;
  }
}
