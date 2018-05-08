import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HeroesComponent } from './heroes/heroes.component';
import { HeroesV1Component } from './heroes/heroes.v1.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: HeroesComponent }
];
// const routes: Routes = [{ path: '', pathMatch: 'full', component: HeroesV1Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HeroesRoutingModule {}
