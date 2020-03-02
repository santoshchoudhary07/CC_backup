import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';
import { ControlValueAccessor } from './control-value-accessor';

@Component({
  selector: 'ma-number',
  template: `
  <input class="field" type="text" [name]="name" [id]="id ? id : ''" [(ngModel)]="value" [disabled]="disabled" [readonly]="readonly"
  [required]="required" [placeholder]="placeholder ? placeholder : ''" (keypress)="onKeyPress($event)" (blur)="onTouched()" [min]="min" [max]="max">
  `,
  styles: [],
  providers: [MakeProvider(MaNumberComponent)]
})
export class MaNumberComponent extends MaInputComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() ngModel: number;
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() maxLength: string;
  @Input() max: number;
  @Input() min: number;
  @Input() name: string;
  @Input() id: string;
  @Input() placeholder: string;
  @Output() maNumberOnChange = new EventEmitter<number>();
  @Output() ngModelChange = new EventEmitter<number>();

  initialized: boolean;

  constructor() { super(); }

  ngOnInit() {
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized && changes.ngModel && changes.ngModel.currentValue !== changes.ngModel.previousValue) {
      this.updateValue();
    }
  }

  updateValue(): void {
    this.ngModel = this.value;
    this.ngModelChange.emit(this.ngModel);
    this.maNumberOnChange.emit(this.ngModel);
  }

  onKeyPress(event: any): any {
    setTimeout(() => {
    this.updateValue();
    }, 100);
    return ((event.charCode == 8 || event.charCode == 0 || event.charCode == 13) ? null : event.charCode >= 48 && event.charCode <= 57)
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onTouched() { }
}
