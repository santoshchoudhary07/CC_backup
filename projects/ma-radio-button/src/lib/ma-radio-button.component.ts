import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, OnChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';

@Component({
  selector: 'ma-radio-button',
  template: `
  <div class="radios-inline">
    <div class="radio radio-inline">
     <input [value]="radioValue" [(ngModel)]="value" type="radio" name="radio-name" [id]="id" (change)="onRadioButtonChange()" [disabled]="disabled" 
      [required]="required" (click)="this.checked = !readonly;">
     <label [for]="id"><ng-content></ng-content></label>
    </div>
  </div>
  `,
  providers: [MakeProvider(MaRadioButtonComponent)],
  styles: []
})
export class MaRadioButtonComponent extends MaInputComponent implements OnInit, OnChanges {
  @Input() ngModel: any;
  @Input() id: string;
  @Input() radioValue: any;
  @Input() disabled: boolean;
  @Input() readonly: boolean;
  @Input() required: boolean;
  @Output() maRadioButtonChange = new EventEmitter<any>();
  @Output() ngModelChange = new EventEmitter<any>();

  checked: any;

  constructor() {
    super();
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  onRadioButtonChange(): void {
    this.ngModel = this.value;
    this.ngModelChange.emit(this.ngModel);
    this.maRadioButtonChange.emit(this.ngModel);
  }
}
