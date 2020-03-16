import { Component, OnInit, Input, Output, EventEmitter, OnChanges, AfterViewChecked, ChangeDetectorRef } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';
import { ControlValueAccessor } from './control-value-accessor';

@Component({
  selector: 'ma-photo',
  template: `
  <div *ngIf="displayPhotos" (click)="onTouched();changeDetectorRef.detectChanges()">
    <ng-container *ngIf="isActive; else simple">
        <i *ngIf="tempList.length === 0" class="ico-add-photo inline-space-right pull-right" (click)="openPhotosModal()"></i>
        <i *ngIf="tempList.length > 0" class="ico-edit-blue pull-right" (click)="!(ngModel?.length >= max) && openPhotosModal()"></i>
        <div *ngIf="tempList.length > 0" (click)="openPhotosModal()" [class.disabled-edit-photo]="ngModel?.length >= max"><a href="javascript:void(0)">View/Edit Photos</a></div>
        <div *ngIf="tempList.length === 0" (click)="openPhotosModal()"><a href="javascript:void(0)">Add Photos</a></div>
        <ma-photo-modal *ngIf="displayPhotosModal && !disabled" [(ngModel)]="ngModel" [multiple]="multiple" [isActive]="isActive" [readOnly]="readonly" [disabled]="disabled" [required]="required" [id]="id" [name]="name" (close)="closePhotosModal($event)" (ngModelChange)="ngModelChangeList($event)"></ma-photo-modal>
    </ng-container>
    <ng-template #simple>
        <i *ngIf="displayPhotos.length === 0" class="ico-add-photo inline-space-right pull-right" (click)="openPhotosModal()"></i>
        <i *ngIf="displayPhotos.length > 0" class="ico-edit-blue pull-right" (click)="!(ngModel?.length >= max) && openPhotosModal()"></i>
        <div *ngIf="displayPhotos.length > 0" (click)="openPhotosModal()" [class.disabled-edit-photo]="ngModel?.length >= max"><a href="javascript:void(0)">View/Edit Photos</a></div>
        <div *ngIf="displayPhotos.length === 0" (click)="openPhotosModal()"><a href="javascript:void(0)">Add Photos</a></div>
        <ma-photo-modal *ngIf="displayPhotosModal && !disabled" [(ngModel)]="ngModel" [multiple]="multiple" [isActive]="isActive" [readOnly]="readonly" [disabled]="disabled" [required]="required" [id]="id" [name]="name" (close)="closePhotosModal($event)"></ma-photo-modal>
    </ng-template>
</div>
  `,
  styles: ['a:link {color: #2c87f0;} .disabled-edit-photo {cursor: not-allowed;pointer-events: none;opacity: 0.4;}'],
  providers: [MakeProvider(MaPhotoComponent)]
})
export class MaPhotoComponent extends MaInputComponent implements OnInit, OnChanges, AfterViewChecked, ControlValueAccessor {
  @Input() ngModel: any[];
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() multiple: boolean;
  @Input() isActive: boolean;
  @Input() max: number;
  @Input() name: string;
  @Input() id: string;
  @Output() maPhotosOnChange = new EventEmitter<any[]>();
  @Output() ngModelChange = new EventEmitter<any[]>();

  displayPhotos: any[];
  displayPhotosModal: boolean;
  tempList: any[];
  constructor(public changeDetectorRef: ChangeDetectorRef) {
    super();
    this.ngModel = [];
  }

  ngOnInit () {
  }

  ngOnChanges (): void {
    this.ngModel = (this.ngModel && this.ngModel.length === 0) ? null : this.ngModel;
    this.ngModel = this.ngModel || [];
    this.value = this.ngModel;
    this.displayPhotos = [];
    this.tempList = [];
    this.initPhotos();
    if (this.isActive) {
      this.listData();
    }
  }

  listData (): any {
    this.tempList = this.ngModel.filter(item => (item.varbinary && item.active && item.string));
  }

  ngModelChangeList (data: any[]): void {
    this.ngModelChange.emit(data);
    this.maPhotosOnChange.emit(data);
  }

  ngAfterViewChecked (): void {
    this.changeDetectorRef.detectChanges();
  }

  writeValue (value: any): void {
    if (value && value.length > 0) {
      this.ngModel = this.value = value;
      this.initPhotos();
    }
  }

  openPhotosModal (): void {
    if (!this.readonly && !this.disabled) {
      this.displayPhotosModal = true;
    }
  }

  closePhotosModal (changed: boolean): void {
    if (changed) {
      this.value = this.ngModel;
      this.ngModelChange.emit(this.ngModel);
      this.maPhotosOnChange.emit(this.ngModel);
    }
    this.initPhotos();
    this.displayPhotosModal = false;
  }

  registerOnTouched (fn: any): void {
    this.onTouched = fn;
  }

  onTouched () {
  }

  private initPhotos (): void {
    this.displayPhotos = [];
    for (var p = 0; p < this.ngModel.length; p++) {
      if (this.ngModel[p].varbinary) {
        this.displayPhotos.push(this.ngModel[p]);
      }
    }
  }
}
