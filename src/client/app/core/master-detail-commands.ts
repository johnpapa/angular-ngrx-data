/**
 * Commands that a child component (presenter) sends to its parent (container) component
 * in a classic Master/Detail view.
 */
export interface MasterDetailCommands<T> {
  /** Close/hide the detail component */
  close: () => void;
  /** Add a new entity */
  add: (entity: T) => void;
  /** Delete an entity */
  delete: (entity: T) => void;
  /** "Select" an entity */
  select: (entity: T) => void;
  /** Update an entity */
  update: (entity: T) => void;
}
