import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VillainsComponent } from './villains/villains.component';
import { VillainEditorComponent } from './villain-editor/villain-editor.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: VillainsComponent },
  { path: ':id', component: VillainEditorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VillainsRoutingModule {}
