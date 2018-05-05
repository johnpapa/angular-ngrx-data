import { ModuleWithProviders, NgModule, InjectionToken } from '@angular/core';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { EffectsModule, EffectSources } from '@ngrx/effects';

@NgModule({
  imports: [
    StoreModule.forFeature('FooState', {}),
    EffectsModule.forFeature([]) // do not supply effects because can't replace later
  ],
  providers: []
})
export class NgrxDataModule {
}
