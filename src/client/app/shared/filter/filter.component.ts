import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, takeUntil, take, tap } from 'rxjs/operators';

import { EntityService } from '../../../ngrx-data';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnDestroy, OnInit {
  @Input() entityService: EntityService<any>;
  @Input() filterPlaceholder: string;

  filter: FormControl = new FormControl();
  updateFilter: (pattern: any) => void;

  private onDestroy = new Subject();

  ngOnInit() {
    // Set the filter to the current value from store or ''
    this.entityService.filter$
      .pipe(
        take(1)
        // always completes so no need to unsubscribe
      )
      .subscribe(value => this.filter.setValue(value));

    this.updateFilter = this.entityService.setFilter.bind(this.entityService);
    this.filter.valueChanges
      .pipe(takeUntil(this.onDestroy), debounceTime(300), distinctUntilChanged())
      .subscribe(pattern => this.updateFilter(pattern));
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
  }
}
