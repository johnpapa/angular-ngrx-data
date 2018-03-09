import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { VillainsRoutingModule } from './villains-routing.module';
import { VillainListComponent } from './villain-list/villain-list.component';
import { VillainDetailComponent } from './villain-detail/villain-detail.component';
import { VillainEditorComponent } from './villain-editor/villain-editor.component';
import { VillainsComponent } from './villains/villains.component';
import { VillainsService } from './villains.service';


@NgModule({
  imports: [CommonModule, ReactiveFormsModule, VillainsRoutingModule, SharedModule],
  exports: [VillainListComponent, VillainDetailComponent],
  declarations: [VillainListComponent, VillainDetailComponent, VillainEditorComponent, VillainsComponent],
  providers: [ VillainsService ]
})
export class VillainsModule {}
