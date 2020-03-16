import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MaInputComponent, MakeProvider } from './ma-input.component';
import { HostListener } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ControlValueAccessor } from './control-value-accessor';
import { isString } from 'util';

@Component({
    selector: 'ma-date',
    templateUrl: 'ma-date.component.html',
    styles: [],
    providers: [MakeProvider(MaDateComponent)]
})
export class MaDateComponent extends MaInputComponent implements OnInit, OnChanges, ControlValueAccessor {
    @Input() ngModel: Date;
    @Input() name: string;
    @Input() id: any;
    @Input() readOnly: boolean;
    @Input() disabled: boolean;
    @Input() required: boolean;
    @Input() minDate: any;
    @Input() inputReadOnly: boolean;
    @Input() maxDate: any;
    @Input() placeholder: string;
    @Input() displayDateFormat: string;
    @Input() isDateObject: boolean;
    @Input() pickerFocusOpen: boolean;
    @Output() maDateOnChange = new EventEmitter<Date>();
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
        this.value = this.ngModel = (this.ngModel ? new Date(this.ngModel) : this.ngModel);
        if (this.ngModel && Object.prototype.toString.call(this.ngModel) === '[object Date]') {
            this.displayDate = new DatePipe('en-US').transform(this.ngModel, this.displayDateFormat ? this.displayDateFormat : 'MM/dd/yyyy');
        } else {
            this.displayDate = '';
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.minDate = this.minDate ? (this.isValidDate(this.minDate) ? this.minDate : new Date(Date.parse(this.minDate))) : null;
        this.maxDate = this.maxDate ? (this.isValidDate(this.maxDate) ? this.maxDate : new Date(Date.parse(this.maxDate))) : null;
    }

    initDate(): void {
        if (this.ngModel && Object.prototype.toString.call(this.ngModel) === '[object Date]') {
            this.displayDate = new DatePipe('en-US').transform(this.ngModel, this.displayDateFormat ? this.displayDateFormat : 'MM/dd/yyyy');
        } else {
            this.displayDate = null;
        }
    }

    updateValue(date: Date): void {
        if (date && !this.readOnly && !this.disabled) {
            this.ngModel = date;
            this.convertToDate(true);
        }
        this.value = this.ngModel;
        this.maDateOnChange.emit(this.ngModel);
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
        if (!this.readOnly && !this.disabled) {
            this.datePickerOpen = !this.datePickerOpen;
        }
    }

    closeDatePicker(): void {
        this.datePickerOpen = false;
    }

    isValidDate(date: any) {
        return date && Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date);
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    onTouched() { }

    private initialize(): void {
        this.ngModel = new Date();
        this.displayDate = '';
        this.datePickerOpen = false;
    }
}
