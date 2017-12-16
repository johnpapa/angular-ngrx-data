import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';
import { debounceTime, distinctUntilChanged, takeUntil, take, tap } from 'rxjs/operators';

import { EntityDispatcherService, EntitySelectorsService } from '../../../ngrx-data';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnDestroy, OnInit {

  @Input() entityType: string;
  @Input() filterPlaceholder: string;

  filter: FormControl = new FormControl();
  updateFilter: (pattern: any) => void;

  private onDestroy = new Subject();

  constructor(
    private dispatcherService: EntityDispatcherService,
    private selectorsService: EntitySelectorsService
  ) {}

  ngOnInit() {
    // Set the filter to the current value from store or ''
    const ss = this. selectorsService.getSelectors$(this.entityType);
    ss.selectFilter$.pipe(take(1),
      // always completes so no need to unsubscribe
    ).subscribe(value => this.filter.setValue(value));

    const ds = this. dispatcherService.getDispatcher(this.entityType);
    this.updateFilter = ds.setFilter.bind(ds);
    this.filter.valueChanges.pipe(
      takeUntil(this.onDestroy),
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe(pattern => this.updateFilter(pattern));
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
  }
}
