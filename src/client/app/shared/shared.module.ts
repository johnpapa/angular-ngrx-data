import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatInputModule
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

import { FilterComponent } from './filter/filter.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatToolbarModule,
    ReactiveFormsModule
  ],
  exports: [
    FilterComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatToolbarModule,
    ReactiveFormsModule
  ],
  declarations: [FilterComponent]
})
export class SharedModule {}
