import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatInputModule
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatToolbarModule
  ],
  exports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatToolbarModule
  ],
  declarations: []
})
export class SharedModule {}
