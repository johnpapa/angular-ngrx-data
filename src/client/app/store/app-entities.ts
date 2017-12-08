// Not sure where this file belongs.
// Is it part of the model? Or part of the store.
// Do NOT want to mix it with code that will become the entity library
import { EntityCache, EntityCollection, initialEntityCollectionState } from '../../ngrx-data';

import { Hero, Villain } from '../core';

export const initialEntityCache: EntityCache = {
  Hero: initialEntityCollectionState as EntityCollection<Hero>,
  Villain: initialEntityCollectionState as EntityCollection<Villain>
};
