import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MaInputComponent, MakeProvider } from './ma-input.component';

@Component({
  selector: 'ma-datetime',
  template: `
  <div class="datetime">
  <ma-date name="date_{{name}}" id="date_{{id}}" [(ngModel)]="ngModel" [minDate]="minDate" [maxDate]="maxDate" [readOnly]="readOnly"
      [disabled]="disabled" [required]="required" [placeholder]="datePlaceholder" [displayDateFormat]="displayDateFormat" (maDateOnChange)="updateValue()"></ma-date>
  <div class="time">
  <ma-selects name="ampm_{{name}}" id="ampm_{{id}}" [(ngModel)]="displayHour" [options]="hoursList" [optionId]="'name'" [readOnly]="readOnly" [disabled]="disabled"
  (onMaSelectChange)="updateValue()" [placeholder]="hoursPlaceholder"></ma-selects>
  <ma-selects name="ampm_{{name}}" id="ampm_{{id}}" [(ngModel)]="displayMinute"  [optionId]="'name'" [options]="minutesList" [readOnly]="readOnly" [disabled]="disabled"
  (onMaSelectChange)="updateValue()" [placeholder]="minutesPlaceholder"></ma-selects>
  <ma-selects name="ampm_{{name}}" id="ampm_{{id}}" [(ngModel)]="displayAMPM.id" [options]="AMPM" [readOnly]="readOnly"
  [disabled]="disabled" (onMaSelectChange)="updateValue()"></ma-selects>
  </div>
  </div>
  `,
  styles: [],
  providers: [MakeProvider(MaDateTimeComponent)]
})
export class MaDateTimeComponent extends MaInputComponent implements OnInit, OnChanges {
  @Input() ngModel: Date;
  @Input() minDate: Date;
  @Input() maxDate: Date;
  @Input() name: boolean;
  @Input() id: boolean;
  @Input() readOnly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() datePlaceholder: string;
  @Input() hoursPlaceholder: string;
  @Input() minutesPlaceholder: string;
  @Input() displayDateFormat: string;
  @Output() maDateOnChange = new EventEmitter<Date>();
  @Output() ngModelChange = new EventEmitter<Date>();

  displayDate: string;
  displayHour: number;
  displayMinute: number;
  AMPM: any[];
  displayAMPM: any;
  minutesList: any[];
  hoursList: any[];
  initialized: boolean;

  constructor() {
    super();
    this.initialize();
  }

  ngOnInit() {
    this.setMinutesHoursList();
    this.value = this.ngModel = (this.ngModel ? new Date(this.ngModel) : this.ngModel);
    if (this.ngModel && Object.prototype.toString.call(this.ngModel) === '[object Date]') {
      this.displayHour = this.ngModel.getHours();
      this.displayMinute = this.ngModel.getMinutes();
      this.displayAMPM = this.displayHour > 12 ? this.AMPM[1] : this.AMPM[0];
      this.displayHour = this.displayHour % 12;
      this.displayHour = this.displayHour ? this.displayHour : 12;
    }
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized && changes.ngModel && changes.ngModel.currentValue !== changes.ngModel.previousValue) {
      this.updateValue();
    }
  }

  updateValue(): void {
    if (this.ngModel && Object.prototype.toString.call(this.ngModel) === '[object Date]') {
      this.ngModel.setMinutes(this.displayMinute);
      this.ngModel.setHours(this.displayAMPM.id === 2 && this.displayHour !== 12 ? this.displayHour + 12 : this.displayHour);
      this.value = this.ngModel;
      this.ngModelChange.emit(this.ngModel);
      this.maDateOnChange.emit(this.ngModel);
    }
  }

  convertToDate(): void {
    this.ngModel = new Date(Date.parse(this.displayDate));
    if (Object.prototype.toString.call(this.ngModel) === '[object Date]') {
      if (isNaN(this.ngModel.getTime())) {
        this.ngModel = null;
        this.displayDate = '';
      } else {
        this.displayDate = new DatePipe('en-US').transform(this.ngModel, 'MM/dd/yyyy');
      }
    }
  }

  private setMinutesHoursList(): void {
    for (let index = 1; index <= 59; index++) {
      this.minutesList.push({ name: index });
      if (index <= 11) {
        this.hoursList.push({ name: index });
      }
    }
  }

  private initialize(): void {
    this.displayDate = '';
    this.hoursList = [];
    this.minutesList = [];
    this.displayHour = null;
    this.displayMinute = null;
    this.AMPM = [{ id: 1, name: 'AM' }, { id: 2, name: 'PM' }];
    this.displayAMPM = this.AMPM[0];
  }
}
