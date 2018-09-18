import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable, Subscription } from 'rxjs';

import { FilterObserver } from '../../shared/filter';
import { MasterDetailCommands, Villain } from '../../core';
import { VillainsService } from '../villains.service';

@Component({
  selector: 'app-villains',
  templateUrl: './villains.component.html',
  styleUrls: ['./villains.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VillainsComponent implements MasterDetailCommands<Villain>, OnInit, OnDestroy {
  commands = this;
  selectedVillain: Villain = null;
  subscription: Subscription;

  filterObserver: FilterObserver;
  filteredVillains$: Observable<Villain[]>;
  loading$: Observable<boolean>;

  constructor(public villainsService: VillainsService) {
    this.filterObserver = villainsService.filterObserver;
    this.filteredVillains$ = this.villainsService.filteredEntities$;
    this.loading$ = this.villainsService.loading$;
  }

  ngOnInit() {
    this.subscription = this.villainsService.getAllOnDataSourceChange.subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  close() {
    this.selectedVillain = null;
  }

  enableAddMode() {
    this.selectedVillain = <any>{};
  }

  getVillains() {
    this.villainsService.getAll();
    this.close();
  }

  add(villain: Villain) {
    this.villainsService.add(villain);
  }

  delete(villain: Villain) {
    this.close();
    this.villainsService.delete(villain.id);
  }

  deleteAll() {
    this.close();
    this.villainsService.deleteAll();
  }

  select(villain: Villain) {
    this.selectedVillain = villain;
  }

  update(villain: Villain) {
    this.villainsService.update(villain);
  }
}
