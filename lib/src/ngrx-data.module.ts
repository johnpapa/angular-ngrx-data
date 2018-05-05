import { ModuleWithProviders, NgModule, InjectionToken } from '@angular/core';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { EffectsModule, EffectSources } from '@ngrx/effects';

import { FooModule } from './foo.module';

@NgModule({
  imports: [
    FooModule.forNothing(), // works
    StoreModule.forFeature('FooState', {}), // forFeature causes build fail
    EffectsModule.forFeature([]) // forFeature causes build fail
  ],
  providers: []
})
export class NgrxDataModule {
}
