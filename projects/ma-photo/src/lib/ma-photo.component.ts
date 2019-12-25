import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

import { PhotoModel } from './photo.model';
import { MaInputComponent, MakeProvider } from './ma-input.component';
import { ControlValueAccessor } from './control-value-accessor';

@Component({
  selector: 'ma-photo',
  template: `
  <div>
  <i *ngIf="displayPhotos.length === 0" class="ico-add-photo inline-space-right pull-right" (click)="openPhotosModal()"></i>
  <i *ngIf="displayPhotos.length > 0" class="ico-edit-blue pull-right" (click)="openPhotosModal()"></i>
  <div *ngIf="displayPhotos.length > 0" (click)="openPhotosModal()">View/Edit Photos</div>
  <div *ngIf="displayPhotos.length === 0" (click)="openPhotosModal()">Add Photos</div>
  <ma-photo-modal *ngIf="displayPhotosModal && !disabled" [(ngModel)]="ngModel" [readOnly]="readonly" [disabled]="disabled"
    [required]="required" [id]="id" [name]="name" (close)="closePhotosModal($event)"></ma-photo-modal>
</div>
  `,
  styles: [],
  providers: [MakeProvider(MaPhotoComponent)]
})
export class MaPhotoComponent extends MaInputComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() ngModel: any[];
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() name: string;
  @Input() id: string;
  @Output() maPhotosOnChange = new EventEmitter<PhotoModel[]>();

  displayPhotos: PhotoModel[];
  displayPhotosModal: boolean;

  constructor() {
    super();
    this.ngModel = [];
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.ngModel);
    this.ngModel = (this.ngModel && this.ngModel.length === 0) ? null : this.ngModel;
    this.ngModel = this.ngModel || [new PhotoModel()];
    this.value = this.ngModel;
    this.displayPhotos = [];
    this.initPhotos();
  }

  writeValue(value: any): void {
    if (value && value.length > 0) {
      this.ngModel = value;
      this.initPhotos();
    }
    console.log(value);
  }

  openPhotosModal(): void {
    this.displayPhotosModal = true;
  }

  closePhotosModal(changed: boolean): void {
    if (changed) { this.maPhotosOnChange.emit(this.ngModel); }
    this.initPhotos();
    this.displayPhotosModal = false;
  }

  private initPhotos(): void {
    this.displayPhotos = [];
    for (var p = 0; p < this.ngModel.length; p++) {
      if (this.ngModel[p].varbinary && this.ngModel[p].active) {
        this.displayPhotos.push(this.ngModel[p]);
      }
    }
  }
}
