import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-inputs';
import { ControlValueAccessor } from './control-value-accessor';

@Component({
  selector: 'ma-text',
  template: `
  <input type="text" [name]="name" [id]="id ? id : ''" class="field" [(ngModel)]="value" [placeholder]="placeholder ? placeholder : ''" [disabled]="disabled"
  [readonly]="readonly" [required]="required" [maxlength]="maxlength" (blur)="onTouched();blur.emit()">
  `,
  styles: [],
  providers: [MakeProvider(MaTextComponent)]

})
export class MaTextComponent extends MaInputComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() ngModel: string;
  @Input() placeholder: string;
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() id: string;
  @Input() name: string;
  @Input() maxlength: number;
  @Output() ngModelChange = new EventEmitter<string>();
  @Output() maTextOnChange = new EventEmitter<string>();
  @Output() blur = new EventEmitter<any>();

  initialized: boolean;

  constructor() {
    super();
  }

  ngOnInit() {
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized && changes.ngModel && changes.ngModel.currentValue !== changes.ngModel.previousValue) {
      this.updateValue();
    }
  }

  updateValue(): void {
    this.value = this.ngModel;
    this.ngModelChange.emit(this.ngModel);
    this.maTextOnChange.emit(this.ngModel);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onTouched() { }
}
