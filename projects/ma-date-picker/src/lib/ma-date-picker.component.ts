import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef, OnChanges, Optional, Host } from '@angular/core';
import { DatePipe } from '@angular/common';
import { isString } from 'util';

import { MaInputComponent, MakeProvider } from './ma-input.component';
import { ControlValueAccessor } from './control-value-accessor';
import { ControlContainer, NgForm } from '@angular/forms';

@Component({
  selector: 'ma-date-picker',
  templateUrl: 'ma-date-picker.component.html',
  providers: [MakeProvider(MaDatePickerComponent)]
})
export class MaDatePickerComponent extends MaInputComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() ngModel: Date;
  @Input() name: string;
  @Input() id: any;
  @Input() readOnly: boolean;
  @Input() inputReadOnly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() isDisabledInput: boolean;
  @Input() isDateObject: boolean;
  @Input() pickerFocusOpen: boolean;
  @Input() minDate: any;
  @Input() maxDate: any;
  @Input() disabledMasking: boolean;
  @Input() placeholder: string;
  @Input() displayDateFormat: string;
  @Input() formControlName: string;
  @Output() maDateOnChange = new EventEmitter<Date>();
  @Output() ngModelChange = new EventEmitter<Date>();
  displayDate: string;
  datePickerOpen: boolean;
  maskType: string;
  isMasking: boolean;
  unMaskValue: boolean;
  form: any;
  formControlResetRequired: boolean;
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeDatePicker();
    }
  }

  constructor(private eRef: ElementRef,
    @Optional() @Host() public parent: ControlContainer) {
    super();
    this.initialize();
  }

  ngOnInit() {
    this.formControlResetRequired = true;
    this.controlMarkAsPristine();
  }

  ngOnChanges() {
    if (!this.disabledMasking) {
      this.checkMaskType();
    }
    this.minDate = this.minDate ? (this.isValidDate(this.minDate) ? this.minDate : new Date(Date.parse(this.minDate))) : null;
    this.maxDate = this.maxDate ? (this.isValidDate(this.maxDate) ? this.maxDate : new Date(Date.parse(this.maxDate))) : null;
  }

  controlMarkAsPristine(): void {
    setTimeout(() => {
      this.form = (this.parent as NgForm);
      if (this.formControlName) {
        if (this.formControlResetRequired && this.form && this.form.form.controls[this.formControlName ? this.formControlName : this.name]) {
          this.form.form.controls[this.formControlName ? this.formControlName : this.name].markAsPristine();
          this.formControlResetRequired = false;
        }
      } else {
        if (this.formControlResetRequired && this.form && this.form.controls[this.formControlName ? this.formControlName : this.name]) {
          this.form.controls[this.formControlName ? this.formControlName : this.name].markAsPristine();
          this.formControlResetRequired = false;
        }
      }
    }, 100);
  }

  checkMaskType(): void {
    if (this.displayDateFormat.indexOf('/') > -1) {
      this.isMasking = true;
      const format = this.displayDateFormat.split('/');
      if (format.length > 2) {
        const type = this.dateFormat(format);
        this.maskType = `${type.mm}/${type.dd}/${type.yyyy}`;
      }
    } else if (this.displayDateFormat.indexOf('-') > -1) {
      this.isMasking = true;
      const format = this.displayDateFormat.split('-');
      const type = this.dateFormat(format);
      this.maskType = `${type.mm}-${type.dd}-${type.yyyy}`;
    }
  }

  dateFormat(format: any[]): any {
    if (format[0].length === 1) {
      this.isMasking = false;
    }
    const mm = format[0].length === 2 ? '00' : (format[0].length === 4 ? '0000' : '');
    const dd = format[1].length === 2 ? '00' : (format[1].length === 4 ? '0000' : '');
    const yyyy = format[2].length === 2 ? '00' : (format[2].length === 4 ? '0000' : '');
    return { mm, dd, yyyy };
  }

  setValue(): void {
    if (this.displayDate && this.displayDate.length === this.displayDateFormat.length) {
      const date = new Date(Date.parse(this.displayDate));
      this.ngModel = isNaN(date.getTime()) ? null : date;
      this.checkInvalidDate();
      this.displayDate = new DatePipe('en-US').transform(this.ngModel, this.displayDateFormat ? this.displayDateFormat : 'MM/dd/yyyy');
    }
  }

  writeValue(value: any): void {
    if (!this.disabledMasking) {
      value = isString(value) ? (value.length === this.displayDateFormat.length ? value : null) : value;
    }
    if (value) {
      this.value = this.ngModel = isString(value) ? new Date(Date.parse(value)) : (isNaN(value.getTime()) ? null : value);
      this.initDate();
      this.value = this.isDateObject ? this.value : this.displayDate;
    } else {
      this.value = this.ngModel = null;
    }
  }

  initDate(): void {
    if (this.ngModel && Object.prototype.toString.call(this.ngModel) === '[object Date]') {
      this.displayDate = new DatePipe('en-US').transform(this.ngModel, this.displayDateFormat ? this.displayDateFormat : 'MM/dd/yyyy');
    } else {
      this.displayDate = null;
    }
  }

  isValidDate(date: any) {
    return date && Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date);
  }

  updateValue(date?: Date): void {
    if (date && !this.readOnly && !this.disabled) {
      this.ngModel = date;
      this.convertToDate(true);
    }
    this.checkInvalidDate();
    setTimeout(() => {
      this.value = this.isDateObject ? this.ngModel : this.displayDate;
      this.ngModelChange.emit(this.value);
      this.maDateOnChange.emit(this.value);
    }, 100);
  }

  convertToDate(ignoreDisplayDate: boolean): void {
    if (!ignoreDisplayDate) {
      this.value = this.isDateObject ? new Date(Date.parse(this.displayDate)) : this.displayDate;
      this.ngModel = new Date(Date.parse(this.displayDate));
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

  disableInput(event: any): void {
    event.preventDefault();
  }

  openDatePicker(): void {
    this.onTouched();
    if (!this.readOnly && !this.disabled) {
      this.datePickerOpen = !this.datePickerOpen;
    }
  }

  closeDatePicker(): void {
    this.datePickerOpen = false;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onTouched() { }

  private checkMinMaxDate(): void {
    const today = new Date();
    if (this.minDate.setHours(0, 0, 0, 0) >= this.maxDate.setHours(0, 0, 0, 0)) {
      this.minDate = today;
    }

    if (this.maxDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
      this.maxDate = today;
    }
  }

  private checkInvalidDate(): void {
    this.maxDate = this.maxDate ? (isNaN(this.maxDate.getTime()) ? null : new Date(this.maxDate)) : null;
    this.minDate = this.minDate ? (isNaN(this.minDate.getTime()) ? new Date() : new Date(this.minDate)) : null;
    if (this.minDate && this.maxDate && this.ngModel) {
      this.checkMinMaxDate();

      if (((new Date(this.ngModel).setHours(0, 0, 0, 0) > this.maxDate.setHours(0, 0, 0, 0)) || (new Date(this.ngModel).setHours(0, 0, 0, 0) < this.minDate.setHours(0, 0, 0, 0)))) {
        this.ngModel = null;
        this.displayDate = null;
      }
    }
  }

  private initialize(): void {
    this.ngModel = null;
    this.displayDate = '';
    this.datePickerOpen = false;
  }
}
