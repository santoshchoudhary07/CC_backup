import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';
import { ControlValueAccessor } from './control-value-accessor';

@Component({
  selector: 'ma-text-area',
  template: `
  <textarea class="field textarea" [name]="name" [id]="id" [(ngModel)]="value" [placeholder]="placeholder ? placeholder : ''" [disabled]="disabled"
  [readonly]="readonly" [cols]="columns" [rows]="rows" [maxlength]="maxLength" [required]="required" (blur)="onTouched();blur.emit()"></textarea>
  `,
  styles: [],
  providers: [MakeProvider(MaTextAreaComponent)]

})
export class MaTextAreaComponent extends MaInputComponent implements OnInit, OnChanges, ControlValueAccessor {
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
  @Output() blur = new EventEmitter<any>();

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
    this.ngModelChange.emit(this.ngModel);
    this.maTextAreaOnChange.emit(this.ngModel);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onTouched: any = () => { };

  private initialize(): void {
    this.rows = 1;
    this.columns = 1;
    this.maxLength = null;
  }
}
