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

import { Hero } from './model';

@Component({
  selector: 'app-hero-detail',
  template: `
    <div class="editarea">
      <div>
        <div class="editfields">
          <div>
            <label>id: </label>
            <input *ngIf="addingHero" type="number" [(ngModel)]="editingHero.id" placeholder="id" #id />
            <label *ngIf="!addingHero" class="value">{{editingHero.id}}</label>
          </div>
          <div>
            <label>name: </label>
            <input [(ngModel)]="editingHero.name" placeholder="name" #name />
          </div>
          <div>
            <label>saying: </label>
            <input [(ngModel)]="editingHero.saying" placeholder="saying" (keyup.enter)="save()"/>
          </div>
        </div>
        <button (click)="clear()">Cancel</button>
        <button (click)="save()">Save</button>
      </div>
    </div>
    `,
  styleUrls: [`./hero-detail.component.scss`]
})
export class HeroDetailComponent implements AfterViewInit, OnChanges, OnInit {
  @Input() hero: Hero;
  @Output() unselect = new EventEmitter<string>();
  @Output() heroChanged = new EventEmitter<{ mode: string; hero: Hero }>();

  @ViewChild('id') idElement: ElementRef;
  @ViewChild('name') nameElement: ElementRef;

  addingHero = false;
  editingHero: Hero;

  ngAfterViewInit() {
    this.setFocus();
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    this.addingHero = !this.hero;
    this.editingHero = this.cloneIt();
    if (!changes.hero.firstChange) {
      this.setFocus();
    }
  }

  addHero() {
    const hero = this.editingHero;
    this.emitRefresh('add');
  }

  clear() {
    this.unselect.emit();
    this.editingHero = null;
  }

  cloneIt() {
    return Object.assign({}, this.hero);
  }

  emitRefresh(mode: string) {
    this.heroChanged.emit({ mode: mode, hero: this.editingHero });
    this.clear();
  }

  save() {
    if (this.addingHero) {
      this.addHero();
    } else {
      this.updateHero();
    }
  }

  setFocus() {
    if (this.addingHero && this.editingHero) {
      this.idElement.nativeElement.focus();
    } else {
      this.nameElement.nativeElement.focus();
    }
  }

  updateHero() {
    const hero = this.editingHero;
    this.emitRefresh('update');
  }
}
