import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTooltipModule,
  MatToolbarModule,
  MatInputModule
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

import { FilterComponent } from './filter/filter.component';

// Other modules that are both imported and exported
export const modules = [
  CommonModule,
  ReactiveFormsModule,

  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatTooltipModule
];

@NgModule({
  imports: [modules],
  exports: [modules, FilterComponent],
  declarations: [FilterComponent]
})
export class SharedModule {}
