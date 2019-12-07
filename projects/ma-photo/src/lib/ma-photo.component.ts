import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { PhotoModel } from './photo.model';
import { MaInputComponent, MakeProvider } from './ma-input.component';

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
export class MaPhotoComponent extends MaInputComponent implements OnInit {
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
    this.ngModel = this.ngModel || [new PhotoModel()];
    this.value = this.ngModel;
    this.displayPhotos = [];
    this.initPhotos();
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
