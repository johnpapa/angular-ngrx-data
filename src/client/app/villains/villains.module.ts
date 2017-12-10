import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { VillainsRoutingModule } from './villains-routing.module';
import { VillainListComponent } from './villain-list/villain-list.component';
import { VillainDetailComponent } from './villain-detail/villain-detail.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, VillainsRoutingModule, SharedModule],
  exports: [VillainListComponent, VillainDetailComponent],
  declarations: [VillainListComponent, VillainDetailComponent]
})
export class VillainsModule {}
