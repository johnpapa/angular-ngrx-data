// Not sure where this file belongs.
// Is it part of the model? Or part of the store.
// Do NOT want to mix it with code that will become the entity library
import { EntityCache, EntityCollection } from '../../ngrx-data';

import { App, Hero, Villain } from '../core';

export const initialEntityCache: EntityCache = {
  // TODO: for now we need to name the entity entries/collections the same as the model
  App: new EntityCollection<App>(),
  Hero: new EntityCollection<Hero>(),
  Villain: new EntityCollection<Villain>() // TODO no villain exists
};
