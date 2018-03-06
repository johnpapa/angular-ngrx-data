import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { FilterObserver } from '../../shared/filter';
import { Villain } from '../../core';
import { VillainsService } from '../villains.service';

@Component({
  selector: 'app-villains',
  templateUrl: './villains.component.html',
  styleUrls: ['./villains.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VillainsComponent implements OnInit, OnDestroy {
  addingVillain = false;
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

  clear() {
    this.addingVillain = false;
    this.selectedVillain = null;
  }

  deleteVillain(villain: Villain) {
    this.unselect();
    this.villainsService.delete(villain.id);
  }

  enableAddMode() {
    this.addingVillain = true;
    this.selectedVillain = null;
  }

  getVillains() {
    this.villainsService.getAll();
    this.unselect();
  }

  onSelect(villain: Villain) {
    this.addingVillain = false;
    this.selectedVillain = villain;
  }

  update(villain: Villain) {
    this.villainsService.update(villain);
  }

  add(villain: Villain) {
    this.villainsService.add(villain);
  }

  unselect() {
    this.addingVillain = false;
    this.selectedVillain = null;
  }
}
