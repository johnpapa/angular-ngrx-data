import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Villain, MasterDetailCommands } from '../../core';

@Component({
  selector: 'app-villain-list',
  templateUrl: './villain-list.component.html',
  styleUrls: ['./villain-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VillainListComponent {
  @Input() villains: Villain[];
  @Input() selectedVillain: Villain;
  @Input() commands: MasterDetailCommands<Villain>;

  byId(villain: Villain) {
    return villain.id;
  }

  onSelect(villain: Villain) {
    this.commands.select(villain);
  }

  deleteVillain(villain: Villain) {
    this.commands.delete(villain);
  }
}
