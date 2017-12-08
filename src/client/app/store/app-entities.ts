// Not sure where this file belongs.
// Is it part of the model? Or part of the store.
// Do NOT want to mix it with code that will become the entity library
import { EntityCache, EntityCollection } from '../../ngrx-data';

import { Hero, Villain } from '../core';

export const initialEntityCache: EntityCache = {
  // TODO: for now we need to name the entity entries/collections the same as the model

  // TODO: AOT errors ensue when we new up classes here.
  //       We need to rectify this.
  Hero: {} as EntityCollection<Hero>, // new EntityCollection<Hero>(),
  Villain: {} as EntityCollection<Villain> // new EntityCollection<Villain>()
};
