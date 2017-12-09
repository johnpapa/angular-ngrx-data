import {
  AfterViewInit,
  Component,
  Input,
  ElementRef,
  EventEmitter,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
  SimpleChanges
} from '@angular/core';

import { Villain } from '../core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-villain-detail',
  template: `
    <div class="editarea">
      <form [formGroup]="form">
        <div class="editfields">
          <div [hidden]="addMode">
            <label>id: </label>
            <input formControlName="id" #id readonly/>
          </div>
          <div>
            <label>name: </label>
            <input formControlName="name" placeholder="name" #name />
          </div>
          <div>
            <label>saying: </label>
            <input formControlName="saying" placeholder="saying" (keyup.enter)="saveVillain(form)"/>
          </div>
        </div>
        <button type="button" (click)="clear()">Cancel</button>
        <button type="button" (click)="saveVillain(form)">Save</button>
      </form>
    </div>
    `,
  styleUrls: ['./villain-detail.component.scss']
})
export class VillainDetailComponent implements AfterViewInit, OnChanges, OnInit {
  @Input() villain: Villain;
  @Output() unselect = new EventEmitter<string>();
  @Output() add = new EventEmitter<Villain>();
  @Output() update = new EventEmitter<Villain>();

  @ViewChild('name') nameElement: ElementRef;

  addMode = false;
  form = this.fb.group({
    id: [],
    name: ['', Validators.required],
    saying: ['']
  });

  constructor(private fb: FormBuilder) {}

  ngAfterViewInit() {
    this.setFocus();
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.villain.firstChange) {
      this.setFocus();
    }
    if (this.villain && this.villain.id) {
      this.addMode = false;
      this.form.patchValue(this.villain);
    } else {
      this.addMode = true;
    }
  }

  addVillain(form: FormGroup) {
    const { value, valid, touched } = form;
    if (touched && valid) {
      this.add.emit({ ...this.villain, ...value });
    }
    this.clear();
  }

  clear() {
    this.unselect.emit();
  }

  saveVillain(form: FormGroup) {
    if (this.addMode) {
      this.addVillain(form);
    } else {
      this.updateVillain(form);
    }
  }

  setFocus() {
    this.nameElement.nativeElement.focus();
  }

  updateVillain(form: FormGroup) {
    const { value, valid, touched } = form;
    if (touched && valid) {
      this.update.emit({ ...this.villain, ...value });
    }
    this.clear();
  }
}
