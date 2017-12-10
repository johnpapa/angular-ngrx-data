import { Component, OnInit, Optional, EventEmitter } from '@angular/core';

import { InMemoryDataService } from '../core';
import { AppDispatchers } from '../store/app-config';

@Component({
  selector: 'app-toggle-data-source',
  template: `
      <mat-slide-toggle [checked]="isRemote" (change)="toggleDataSource($event.checked)">Remote Data</mat-slide-toggle>
  `,
})
export class ToggleDataSourceComponent {
  nextDataSource: string;
  isRemote: boolean;

  constructor(
    @Optional() private inMemService: InMemoryDataService,
    private appDispatchers: AppDispatchers
  ) {
    this.isRemote = !inMemService;
  }

  toggleDataSource(isRemote: boolean) {
    this.isRemote = isRemote;
    this.inMemService.active = !isRemote;
    const location = isRemote ? 'remote' : 'local';
    this.appDispatchers.toggleDataSource(location);
  }
}
