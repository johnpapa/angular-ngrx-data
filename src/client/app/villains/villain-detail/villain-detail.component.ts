import {
  Component,
  Input,
  ElementRef,
  OnChanges,
  ViewChild,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MasterDetailCommands, Villain } from '../../core';

@Component({
  selector: 'app-villain-detail',
  templateUrl: './villain-detail.component.html',
  styleUrls: ['./villain-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VillainDetailComponent implements OnChanges {
  @Input() villain: Villain;
  @Input() commands: MasterDetailCommands<Villain>;

  @ViewChild('name') nameElement: ElementRef;

  addMode = false;
  form = this.fb.group({
    id: [],
    name: ['', Validators.required],
    saying: ['']
  });

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges) {
    this.setFocus();
    if (this.villain && this.villain.id) {
      this.form.patchValue(this.villain);
      this.addMode = false;
    } else {
      this.form.reset();
      this.addMode = true;
    }
  }

  close() {
    this.commands.close();
  }

  saveVillain() {
    const { dirty, valid, value } = this.form;
    if (dirty && valid) {
      const newVillain = { ...this.villain, ...value };
      this.addMode
        ? this.commands.add(newVillain)
        : this.commands.update(newVillain);
    }
    this.close();
  }

  setFocus() {
    this.nameElement.nativeElement.focus();
  }
}
