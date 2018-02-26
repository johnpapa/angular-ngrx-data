import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable } from 'rxjs/Observable';

import { FilterObserver } from '../../shared/filter';
import { Villain } from '../../core';
import { VillainsService } from '../villains.service';

@Component({
  selector: 'app-villains',
  templateUrl: './villains.component.html',
  styleUrls: ['./villains.component.scss'],
  providers: [ VillainsService ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VillainsComponent implements OnInit {
  addingVillain = false;
  selectedVillain: Villain = null;

  filterObserver: FilterObserver;
  filteredVillains$: Observable<Villain[]>;
  loading$: Observable<boolean>;

  constructor(public villainsService: VillainsService) {
    this.filterObserver = villainsService.filterObserver;
    this.filteredVillains$ = this.villainsService.filteredEntities$;
    this.loading$ = this.villainsService.loading$;
  }

  ngOnInit() {
    this.villainsService.initialize();
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
