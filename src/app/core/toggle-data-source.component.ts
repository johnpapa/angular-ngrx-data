import {
  Component,
  OnInit,
  Optional,
  EventEmitter,
  HostBinding
} from '@angular/core';

import { InMemoryDataService } from '../../in-memory-data.service';
import { AppDispatchers } from '../store/app-config';

@Component({
  selector: 'app-toggle-data-source',
  template: `
  <mat-slide-toggle [checked]="isRemote" (change)="toggleDataSource($event.checked)"
    matTooltip="Toggle between in-memory or remote data">Remote Data</mat-slide-toggle>
  `
})
export class ToggleDataSourceComponent {
  @HostBinding('title') nextDataSource: string;

  isRemote: boolean;

  constructor(
    @Optional() private inMemService: InMemoryDataService,
    private appDispatchers: AppDispatchers
  ) {
    this.isRemote = !inMemService;
    this.nextDataSource = `Getting data from local data source.`;
  }

  toggleDataSource(isRemote: boolean) {
    this.isRemote = isRemote;
    this.inMemService.active = !isRemote;
    const location = isRemote ? 'remote' : 'local';
    this.nextDataSource = `Getting data from ${location} data source.`;
    this.appDispatchers.toggleDataSource(location);
  }
}
