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

import { Villain } from '../../core';

@Component({
  selector: 'app-villain-detail',
  template: `
    <div class="editarea">
      <div>
        <div class="editfields">
          <div>
            <label>id: </label>
            <input *ngIf="addingVillain" type="number" [(ngModel)]="editingVillain.id" placeholder="id" #id />
            <label *ngIf="!addingVillain" class="value">{{editingVillain.id}}</label>
          </div>
          <div>
            <label>name: </label>
            <input [(ngModel)]="editingVillain.name" placeholder="name" #name />
          </div>
          <div>
            <label>saying: </label>
            <input [(ngModel)]="editingVillain.saying" placeholder="saying" (keyup.enter)="save()"/>
          </div>
        </div>
        <button (click)="clear()">Cancel</button>
        <button (click)="save()">Save</button>
      </div>
    </div>
    `,
  styleUrls: ['./villain-detail.component.scss']
})
export class VillainDetailComponent implements AfterViewInit, OnChanges, OnInit {
  @Input() villain: Villain;
  @Output() unselect = new EventEmitter<string>();
  @Output() villainChanged = new EventEmitter<{ mode: string; villain: Villain }>();

  @ViewChild('id') idElement: ElementRef;
  @ViewChild('name') nameElement: ElementRef;

  addingVillain = false;
  editingVillain: Villain;

  ngAfterViewInit() {
    this.setFocus();
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    this.addingVillain = !this.villain;
    this.editingVillain = this.cloneIt();
    if (!changes.villain.firstChange) {
      this.setFocus();
    }
  }

  addVillain() {
    const villain = this.editingVillain;
    this.emitRefresh('add');
  }

  clear() {
    this.unselect.emit();
    this.editingVillain = null;
  }

  cloneIt() {
    return Object.assign({}, this.villain);
  }

  emitRefresh(mode: string) {
    this.villainChanged.emit({ mode: mode, villain: this.editingVillain });
    this.clear();
  }

  save() {
    if (this.addingVillain) {
      this.addVillain();
    } else {
      this.updateVillain();
    }
  }

  setFocus() {
    if (this.addingVillain && this.editingVillain) {
      this.idElement.nativeElement.focus();
    } else {
      this.nameElement.nativeElement.focus();
    }
  }

  updateVillain() {
    const villain = this.editingVillain;
    this.emitRefresh('update');
  }
}
