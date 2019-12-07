import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MaInputComponent, MakeProvider } from './ma-input.component';

@Component({
  selector: 'ma-date-picker',
  template: `
  <div class="datepicker">
    <date-picker [hidden]="!datePickerOpen" [startDate]="minDate" [endDate]="maxDate" [(ngModel)]="value" (maDateOnChange)="updateValue($event);closeDatePicker()"
        ></date-picker>
    <input type="hidden" name="{{name}}" id="{{id}}" class="field hasDatepicker" [(ngModel)]="value" [required]="required" />
    <input type="text" name="display_{{name}}" id="display_{{id}}" class="field hasDatepicker" [(ngModel)]="displayDate" (ngModelChange)="updateValue(null)"
        (blur)="convertToDate(false)" (click)="openDatePicker()" [placeholder]="placeholder" [disabled]="disabled" [readonly]="readOnly" [required]="required">
    <button type="button" class="ui-datepicker-trigger" (click)="openDatePicker()" [disabled]="disabled">...</button>
</div>
  `,

  providers: [MakeProvider(MaDatePickerComponent)]
})
export class MaDatePickerComponent extends MaInputComponent implements OnInit {
  @Input() ngModel: Date;
  @Input() name: string;
  @Input() id: any;
  @Input() readOnly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() minDate: Date;
  @Input() maxDate: Date;
  @Input() placeholder: string;
  @Input() displayDateFormat: string;
  @Output() maDateOnChange = new EventEmitter<Date>();
  @Output() ngModelChange = new EventEmitter<Date>();
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeDatePicker();
    }
  }
  displayDate: string;
  datePickerOpen: boolean;

  constructor(private eRef: ElementRef) {
    super();
    this.initialize();
  }

  ngOnInit() {
    this.value = this.ngModel = (this.ngModel ? new Date(this.ngModel) : null);
    if (this.ngModel && Object.prototype.toString.call(this.ngModel) === '[object Date]') {
      this.displayDate = new DatePipe('en-US').transform(this.ngModel, this.displayDateFormat ? this.displayDateFormat : 'MM/dd/yyyy');
    } else {
      this.displayDate = '';
    }
  }

  updateValue(date: Date): void {
    if (date && !this.readOnly && !this.disabled) {
      this.ngModel = date;
      this.convertToDate(true);
    }
    this.value = this.ngModel;
    this.ngModelChange.emit(this.ngModel);
    this.maDateOnChange.emit(this.ngModel);
  }

  convertToDate(ignoreDisplayDate: boolean): void {
    if (!ignoreDisplayDate) {
      this.value = this.ngModel = new Date(Date.parse(this.displayDate));
    }
    if (Object.prototype.toString.call(this.ngModel) === '[object Date]') {
      if (isNaN(this.ngModel.getTime())) {
        this.value = this.ngModel = null;
        this.displayDate = '';
      } else {
        this.displayDate = new DatePipe('en-US').transform(new Date(this.ngModel), this.displayDateFormat ? this.displayDateFormat : 'MM/dd/yyyy');
      }
    }
  }

  openDatePicker(): void {
    this.datePickerOpen = !this.datePickerOpen;
  }

  closeDatePicker(): void {
    this.datePickerOpen = false;
  }

  private initialize(): void {
    this.ngModel = new Date();
    this.displayDate = '';
    this.datePickerOpen = false;
  }
}
