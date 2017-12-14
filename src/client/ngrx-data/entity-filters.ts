/**
 * Filters the `entities` array argument and returns the `entities`,
 * a memoized array of entities, or a new filtered array.
 * NEVER mutate the `entities` array itself.
 **/
export type EntityFilterFn<T> = (entities: T[], pattern?: any) => T[];

/** EntityFilter function that matches pattern in the given props. */
export function PropsFilter<T>(props: (keyof T)[] = []): EntityFilterFn<T> {

  if (props.length === 0) {
    // No properties -> nothing could match -> return unfiltered
    return (entities: T[], pattern: string) => entities;
  }

  return (entities: T[], pattern: string) => {
    pattern = pattern && pattern.trim();
    if (!pattern) {
      return entities;
    }
    const regEx = new RegExp(pattern, 'i');
    const predicate = (e: any) => props.some(prop => regEx.test(e[prop]));
    return entities.filter(predicate);
  };
}
