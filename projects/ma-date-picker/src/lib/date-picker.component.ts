import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';

@Component({
  selector: 'date-picker',
  templateUrl: './date-picker.component.html',
  styles: ['#ui-datepicker-div{position: absolute;top: 25px;display: block;}'],
  providers: [MakeProvider(DatePickerComponent)]
})
export class DatePickerComponent extends MaInputComponent implements OnInit, OnChanges {
  @Input() ngModel: Date;
  @Input() startDate: Date;
  @Input() endDate: Date;
  @Output() maDateOnChange = new EventEmitter<Date>();

  today: Date;
  selectedMonth: any;
  selectedYear: any;
  calendarDate: Date;
  calendarStartDate: Date;
  years: any[];
  canBlur: boolean;
  monthCount: number;
  days: any[];
  months: any[];

  constructor() {
    super();
    this.initialize();
  }

  ngOnInit() {
    this.value = this.ngModel = (this.ngModel ? new Date(this.ngModel) : new Date());
    if (!this.endDate) {
      this.endDate = this.today;
    }
    if (!this.startDate) {
      this.startDate = new Date();
    }
    this.calendarDate = new Date(this.ngModel);
    this.calendarDate.setDate(1);
    this.initCalendar();
  }

  ngOnChanges() {
    if (this.startDate && this.endDate) {
      this.checkMinMaxDate();
    }
  }

  initCalendar(): void {
    this.years = [];
    for (let y = this.startDate.getFullYear(); y <= this.endDate.getFullYear(); y++) {
      this.years.push({ id: y, name: y.toString() });
    }
    this.selectedYear = this.years[this.IndexOf({ id: this.calendarDate.getFullYear() }, this.years)];
    this.selectedMonth = this.months[this.IndexOf({ id: this.calendarDate.getMonth() }, this.months)];
  }

  weeks(year: number, month: number): any[] {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const weeks = Math.ceil((firstOfMonth.getDay() + lastOfMonth.getDate()) / 7);
    this.calendarStartDate = firstOfMonth;
    this.calendarStartDate.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
    return new Array(weeks);
  }

  date(week: number, day: number): Date {
    const tempDate = new Date(this.calendarStartDate);
    return new Date(tempDate.setDate(tempDate.getDate() + (day + (week * 7))));
  }

  selectDate(date: Date): void {
    this.value = this.ngModel = date;
  }

  incrementMonth(value: number): void {
    if (value === 1) {
      this.monthCount = 0;
    }
    this.calendarDate.setMonth(this.calendarDate.getMonth() + value);
    if ((this.calendarDate.setHours(0, 0, 0, 0) >= this.endDate.setHours(0, 0, 0, 0) && value === 1) || (this.calendarDate.setHours(0, 0, 0, 0) <= this.startDate.setHours(0, 0, 0, 0) && value === -1)) {
      this.calendarDate.setMonth(this.calendarDate.getMonth() - value);
      this.checkPrevMonth(value);
    }
    this.initCalendar();
  }

  allowBlur(status: boolean): void {
    this.canBlur = status;
  }

  private checkPrevMonth(value: number): void {
    if (this.monthCount === 0 && value === -1) {
      this.calendarDate.setMonth(this.calendarDate.getMonth() + value);
      this.monthCount++;
    }
    if (this.calendarDate.getFullYear() < this.startDate.getFullYear() && value === -1) {
      this.calendarDate.setMonth(this.calendarDate.getMonth() - value);
    }
  }

  private checkMinMaxDate(): void {
    if (this.startDate.setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)) {
      this.startDate = new Date();
    }
    if (this.endDate.setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0)) {
      this.endDate = new Date();
    }
  }

  private IndexOf(item: any, array: any[]): number {
    let found = -1;
    array.forEach((c, index) => {
      if (item.id === c.id) {
        found = index;
        return;
      }
    });
    return found;
  }

  private initialize(): void {
    this.today = new Date();
    this.startDate = new Date();
    this.ngModel = new Date();
    this.years = [];
    this.canBlur = true;
    this.monthCount = 0;
    this.days = [
      { id: 0, name: 'Sunday' },
      { id: 1, name: 'Monday' },
      { id: 2, name: 'Tuesday' },
      { id: 3, name: 'Wednesday' },
      { id: 4, name: 'Thursday' },
      { id: 5, name: 'Friday' },
      { id: 6, name: 'Saturday' }
    ];
    this.months = [
      { id: 0, name: 'Jan' },
      { id: 1, name: 'Feb' },
      { id: 2, name: 'Mar' },
      { id: 3, name: 'Apr' },
      { id: 4, name: 'May' },
      { id: 5, name: 'Jun' },
      { id: 6, name: 'Jul' },
      { id: 7, name: 'Aug' },
      { id: 8, name: 'Sep' },
      { id: 9, name: 'Oct' },
      { id: 10, name: 'Nov' },
      { id: 11, name: 'Dec' }
    ];
  }
}
