import { ModuleWithProviders, NgModule, InjectionToken } from '@angular/core';

@NgModule({})
export class FooModule {
  static forNothing(): ModuleWithProviders {
    return {
      ngModule: FooModule,
      providers: []
    };
  }
}
