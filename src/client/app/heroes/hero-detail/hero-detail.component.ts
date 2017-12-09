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
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';

import { Hero } from '../../core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroDetailComponent implements AfterViewInit, OnChanges, OnInit {
  @Input() hero: Hero;
  @Output() unselect = new EventEmitter<string>();
  @Output() add = new EventEmitter<Hero>();
  @Output() update = new EventEmitter<Hero>();

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
    this.nameElement.nativeElement.focus();
  }

  updateHero(form: FormGroup) {
    const { value, valid, touched } = form;
    if (touched && valid) {
      this.update.emit({ ...this.hero, ...value });
    }
    this.clear();
  }
}
