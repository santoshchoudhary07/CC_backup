import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-inputs';

@Component({
  selector: 'ma-text',
  template: `
  <input type="text" [name]="name" [id]="id ? id : 'text-id'" class="field" [(ngModel)]="value" [placeholder]="placeholder ? placeholder : 'Enter value'" [disabled]="disabled"
  [readonly]="readonly" [required]="required">
  `,
  styles: [],
  providers: [MakeProvider(MaTextComponent)]

})
export class MaTextComponent extends MaInputComponent implements OnInit, OnChanges {
  @Input() ngModel: string;
  @Input() placeholder: string;
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() id: string;
  @Input() name: string;
  @Output() ngModelChange = new EventEmitter<string>();
  @Output() maTextOnChange = new EventEmitter<string>();

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
    this.maTextOnChange.emit(this.ngModel);
  }
}
