import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { VillainsRoutingModule } from './villains-routing.module';
import { VillainListComponent } from './villain-list/villain-list.component';
import { VillainDetailComponent } from './villain-detail/villain-detail.component';
import { VillainEditorComponent } from './villain-editor/villain-editor.component';
import { VillainsComponent } from './villains/villains.component';

@NgModule({
  imports: [SharedModule, VillainsRoutingModule],
  exports: [VillainListComponent, VillainDetailComponent],
  declarations: [
    VillainListComponent,
    VillainDetailComponent,
    VillainEditorComponent,
    VillainsComponent
  ]
})
export class VillainsModule {}
