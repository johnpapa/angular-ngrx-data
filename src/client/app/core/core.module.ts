import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  MatButtonModule,
  // MatCardModule,
  MatIconModule,
  MatSlideToggleModule,
  // MatListModule,
  MatToolbarModule
} from '@angular/material';

import { ToggleDataSourceComponent } from './toggle-data-source.component';
import { ToolbarComponent } from './toolbar/toolbar.component';

@NgModule({
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    RouterModule // because we use <router-outlet> and routerLink
  ],
  declarations: [ToggleDataSourceComponent, ToolbarComponent],
  exports: [ToggleDataSourceComponent, ToolbarComponent]
})
export class CoreModule {}
