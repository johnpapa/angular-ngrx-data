import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';

/** FilterComponent binds to a FilterObserver from parent component */
export interface FilterObserver {
  filter$: Observable<string>;
  setFilter(filterValue: string): void;
}

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Input() filterObserver: FilterObserver;
  @Input() filterPlaceholder: string;
  filter: FormControl = new FormControl();

  clear() {
    this.filter.setValue('');
  }

  ngOnInit() {
    // Set the filter to the current value from filterObserver or ''
    // IMPORTANT: filterObserver must emit at least once!
    this.filterObserver.filter$
      .pipe(take(1))
      // take(1) completes so no need to unsubscribe
      .subscribe(value => this.filter.setValue(value));

    this.filter.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      // no need to unsubscribe because subscribing to self
      .subscribe(pattern => this.filterObserver.setFilter(pattern));
  }
}
