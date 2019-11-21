import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, OnChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';
import { ControlValueAccessor } from './control-value-accessor';

@Component({
  selector: 'ma-radio-button',
  template: `
  <div class="radios-inline">
    <div class="radio radio-inline">
     <input [value]="radioValue" [(ngModel)]="value" type="radio" [name]="name" [id]="id" (change)="onRadioButtonChange()" [disabled]="disabled" 
      [required]="required" (click)="this.checked = !readonly;" (blur)="onTouched()">
     <label [for]="id"><ng-content></ng-content></label>
    </div>
  </div>
  `,
  providers: [MakeProvider(MaRadioButtonComponent)],
  styles: []
})
export class MaRadioButtonComponent extends MaInputComponent implements OnInit, ControlValueAccessor {
  @Input() ngModel: any;
  @Input() id: any;
  @Input() name: any;
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

  onRadioButtonChange(): void {
    this.ngModel = this.value;
    this.ngModelChange.emit(this.ngModel);
    this.maRadioButtonChange.emit(this.ngModel);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onTouched() { }
}
