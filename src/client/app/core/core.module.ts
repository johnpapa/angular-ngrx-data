import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IdGeneratorService } from './id-generator.service';
import { ToggleDataSourceComponent } from './toggle-data-source.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SharedModule } from '../shared/shared.module';
import { ToastService } from './toast.service';
import { NgrxDataToastService } from './ngrx-data-toast.service';
import { throwIfAlreadyLoaded } from './module-import-check';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule // because we use <router-outlet> and routerLink
  ],
  declarations: [ToggleDataSourceComponent, ToolbarComponent],
  exports: [ToggleDataSourceComponent, ToolbarComponent],
  providers: [IdGeneratorService, NgrxDataToastService, ToastService]
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule,
    toastService: NgrxDataToastService
  ) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
