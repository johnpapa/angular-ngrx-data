import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VillainSearchComponent } from './villains/villains.component';

const routes: Routes = [{ path: '', pathMatch: 'full', component: VillainSearchComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VillainsRoutingModule {}
