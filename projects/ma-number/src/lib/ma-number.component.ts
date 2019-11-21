import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';
import { ControlValueAccessor } from './control-value-accessor';

@Component({
  selector: 'ma-number',
  template: `
  <input class="field" type="number" [name]="name" [id]="id ? id : ''" [(ngModel)]="value" [disabled]="disabled" [readonly]="readonly"
  [required]="required" [placeholder]="placeholder ? placeholder : ''" (keyup)="onKeyPress($event)" (blur)="onTouched()" [min]="min" [max]="max">
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

  onKeyPress(event: any): boolean {
    this.updateValue();
    if (event.target.value.length === this.maxLength) { return false; }
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onTouched() { }
}
