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

import { Hero } from '../../core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-hero-detail',
  template: `
    <div class="editarea">
      <form [formGroup]="form">
        <div class="editfields">
          <div>
            <label>id: </label>
            <input type="number" formControlName="id" placeholder="id" #id />
          </div>
          <div>
            <label>name: </label>
            <input formControlName="name" placeholder="name" #name />
          </div>
          <div>
            <label>saying: </label>
            <input formControlName="saying" placeholder="saying" (keyup.enter)="saveHero(form)"/>
          </div>
        </div>
        <button type="button" (click)="clear()">Cancel</button>
        <button type="button" (click)="saveHero(form)">Save</button>
      </form>
    </div>
    `,
  styleUrls: ['./hero-detail.component.scss']
})
export class HeroDetailComponent implements AfterViewInit, OnChanges, OnInit {
  @Input() hero: Hero;
  @Output() unselect = new EventEmitter<string>();
  @Output() add = new EventEmitter<Hero>();
  @Output() update = new EventEmitter<Hero>();

  @ViewChild('id') idElement: ElementRef;
  @ViewChild('name') nameElement: ElementRef;

  addMode = false;

  form = this.fb.group({
    id: [, Validators.required],
    name: ['', Validators.required],
    saying: ['']
  });

  constructor(private fb: FormBuilder) {}

  ngAfterViewInit() {
    this.setFocus();
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.hero.firstChange) {
      this.setFocus();
    }
    if (this.hero && this.hero.id) {
      this.addMode = false;
      this.form.patchValue(this.hero);
    } else {
      this.addMode = true;
    }
  }

  addHero(form: FormGroup) {
    const { value, valid, touched } = form;
    if (touched && valid) {
      this.add.emit({ ...this.hero, ...value });
    }
    this.clear();
  }

  clear() {
    this.unselect.emit();
  }

  saveHero(form: FormGroup) {
    if (this.addMode) {
      this.addHero(form);
    } else {
      this.updateHero(form);
    }
  }

  setFocus() {
    if (this.addMode) {
      this.idElement.nativeElement.focus();
    } else {
      this.nameElement.nativeElement.focus();
    }
  }

  updateHero(form: FormGroup) {
    const { value, valid, touched } = form;
    if (touched && valid) {
      this.update.emit({ ...this.hero, ...value });
    }
    this.clear();
  }
}
