import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';

import { EntityService } from 'ngrx-data';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Input() entityService: EntityService<any>;
  @Input() filterPlaceholder: string;
  filter: FormControl = new FormControl();

  clear() {
    this.filter.setValue('');
  }

  ngOnInit() {
    // Set the filter to the current value from store or ''
    this.entityService.filter$
      .pipe(take(1))
      // take(1) completes so no need to unsubscribe
      .subscribe(value => this.filter.setValue(value));

    this.filter.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      // no need to unsubscribe because subscribing to self
      .subscribe(pattern => this.entityService.setFilter(pattern));
  }
}
