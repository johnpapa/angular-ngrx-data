import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, takeUntil, take, tap } from 'rxjs/operators';

import { EntityService } from 'ngrx-data';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnDestroy, OnInit {
  @Input() entityService: EntityService<any>;
  @Input() filterPlaceholder: string;
  filter: FormControl = new FormControl();
  private onDestroy = new Subject();

  clear() {
    this.filter.setValue('');
  }

  ngOnInit() {
    // Set the filter to the current value from store or ''
    this.entityService.filter$
      .pipe(
        take(1)
        // always completes so no need to unsubscribe
      )
      .subscribe(value => this.filter.setValue(value));

    this.filter.valueChanges
      .pipe(takeUntil(this.onDestroy), debounceTime(300), distinctUntilChanged())
      .subscribe(pattern => this.entityService.setFilter(pattern));
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
  }
}
