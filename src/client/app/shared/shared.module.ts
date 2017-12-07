import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [CommonModule, FormsModule, HttpClientModule],
  exports: [CommonModule, FormsModule, HttpClientModule],
  declarations: []
})
export class SharedModule {}
