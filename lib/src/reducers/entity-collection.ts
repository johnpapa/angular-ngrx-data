import { EntityState } from '@ngrx/entity';
import { Dictionary } from '../utils';

export interface EntityCollection<T = any> extends EntityState<T> {
  /** user's filter pattern */
  filter: string;
  /** true if collection was ever filled by QueryAll; forced false if cleared */
  loaded: boolean;
  /** true when multi-entity HTTP query operation is in flight */
  loading: boolean;
  /** Original entity values for entities with unsaved changes */
  originalValues: Dictionary<T>;
}
