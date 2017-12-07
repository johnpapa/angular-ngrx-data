import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavComponent } from './nav.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule // because we use <router-outlet> and routerLink
  ],
  declarations: [NavComponent],
  exports: [NavComponent]
})
export class CoreModule {}
