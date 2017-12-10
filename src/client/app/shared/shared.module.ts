import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatSlideToggleModule,
  MatToolbarModule
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule,
    MatToolbarModule
  ],
  exports: [MatButtonModule, MatCardModule, MatIconModule, MatSlideToggleModule, MatToolbarModule],
  declarations: []
})
export class SharedModule {}
