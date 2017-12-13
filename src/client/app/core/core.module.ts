import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ToggleDataSourceComponent } from './toggle-data-source.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SharedModule } from '../shared/shared.module';
import { ToastService } from './toast.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule // because we use <router-outlet> and routerLink
  ],
  declarations: [ToggleDataSourceComponent, ToolbarComponent],
  exports: [ToggleDataSourceComponent, ToolbarComponent],
  providers: [ToastService]
})
export class CoreModule {}
