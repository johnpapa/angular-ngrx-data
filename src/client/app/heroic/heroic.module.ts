import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { HeroicRoutingModule, routedComponents } from './heroic-routing.module';
import { HeroDetailComponent } from './heroes/hero-detail.component';
import { VillainDetailComponent } from './villains/villain-detail.component';

@NgModule({
  imports: [CommonModule, SharedModule, HeroicRoutingModule],
  exports: [VillainDetailComponent, HeroDetailComponent, routedComponents],
  declarations: [VillainDetailComponent, HeroDetailComponent, routedComponents]
})
export class HeroicModule {}
