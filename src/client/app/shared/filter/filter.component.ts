import {
  Component,
  OnDestroy,
  OnInit,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { pipe } from 'rxjs/util/pipe';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, skip, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnDestroy, OnChanges, OnInit {
  filter: FormControl = new FormControl();
  @Input() filterPattern: string;
  @Input() filterPlaceholder: string;
  @Output() onFilterChange = new EventEmitter<string>();

  private onDestroy = new Subject();
  private filterLogic = pipe(
    takeUntil(this.onDestroy),
    // tap(value => this.filter.setValue(value)),
    debounceTime(300),
    distinctUntilChanged()
  );

  ngOnInit() {
    this.filter.valueChanges
      .pipe(this.filterLogic)
      .subscribe((pattern: string) => this.setFilter(pattern));
  }

  ngOnChanges() {
    console.log(this.filterPattern);
    this.filter.setValue(this.filterPattern);
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
  }

  private setFilter(pattern: string) {
    this.onFilterChange.emit(pattern);
  }
}
