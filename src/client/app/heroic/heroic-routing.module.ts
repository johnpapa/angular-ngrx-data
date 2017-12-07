import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HeroListComponent } from './heroes/hero-list.component';
import { VillainListComponent } from './villains/villain-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'heroes' },
  { path: 'heroes', component: HeroListComponent },
  { path: 'villains', component: VillainListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HeroicRoutingModule {}

export const routedComponents = [HeroListComponent, VillainListComponent];
