export * from './entity.actions';
export * from './entity-data.service';
export * from './entity.dispatchers';
export * from './entity.reducer';
export * from './entity.selectors';
export * from './interfaces';
export * from './ngrx-data.module';

export { Pluralizer, PLURALIZER_NAMES } from './pluralizer';

import { EntityPrePersistEffects } from './entity-pre-persist.effects';
import { EntityPersistEffects } from './entity-persist.effects';
export const entityEffects: any[] = [EntityPrePersistEffects, EntityPersistEffects];
