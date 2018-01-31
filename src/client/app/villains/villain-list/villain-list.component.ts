import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';

import { Villain } from '../../core';

@Component({
  selector: 'app-villain-list',
  templateUrl: './villain-list.component.html',
  styleUrls: ['./villain-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VillainListComponent {
  @Input() villains: Villain[];
  @Input() selectedVillain: Villain;
  @Output() deleted = new EventEmitter<Villain>();
  @Output() selected = new EventEmitter<Villain>();

  byId(villain: Villain) {
    return villain.id;
  }

  onSelect(villain: Villain) {
    this.selected.emit(villain);
  }

  deleteVillain(villain: Villain) {
    this.deleted.emit(villain);
  }
}
