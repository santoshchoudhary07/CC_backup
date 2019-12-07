import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';

@Component({
  selector: 'ma-text-area',
  template: `
  <textarea class="field textarea" [name]="name" [id]="id" [(ngModel)]="value" [placeholder]="placeholder" [disabled]="disabled"
  [readonly]="readonly" [cols]="columns" [rows]="rows" [maxlength]="maxLength" [required]="required"></textarea>
  `,
  styles: [],
  providers: [MakeProvider(MaTextAreaComponent)]

})
export class MaTextAreaComponent extends MaInputComponent implements OnInit, OnChanges {
  @Input() ngModel: string;
  @Input() rows: number;
  @Input() columns: number;
  @Input() maxLength: number;
  @Input() placeholder: string;
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() name: string;
  @Input() id: string;
  @Output() maTextAreaOnChange = new EventEmitter<string>();
  @Output() ngModelChange = new EventEmitter<string>();

  initialized: boolean;

  constructor() {
    super();
    this.initialize();
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
    this.ngModel = this.value;
    this.ngModelChange.emit(this.ngModel);
    this.maTextAreaOnChange.emit(this.ngModel);
  }

  private initialize(): void {
    this.rows = 10;
    this.columns = 30;
    this.valid = false;
    this.maxLength = null;
  }
}
