import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';

@Component({
  selector: 'ma-custom-pattern',
  template: `
  <input class="field" type="text" [(ngModel)]="value" [name]="name"  [maxLength]="maxLength"
  [readonly]="readonly" [disabled]="disabled" [required]="required" [id]="id ? id : 'id'"
  [placeholder]="placeholder ? placeholder : 'Please Enter'" [pattern]="pattern">
  `,
  styles: [],
  providers: [MakeProvider(MaCustomPatternComponent)]
})
export class MaCustomPatternComponent extends MaInputComponent implements OnInit {
  @Input() ngModel: string;
  @Input() pattern: any;
  @Input() required: boolean;
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() maxLength: number;
  @Input() name: string;
  @Input() id: string;
  @Input() placeholder: string;
  @Output() maCustomPatternOnChange = new EventEmitter<string>();
  @Output() ngModelChange = new EventEmitter<string>();

  initialized: boolean;

  constructor() {
    super();
  }

  ngOnInit() {
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && changes.ngModel && changes.ngModel.currentValue !== changes.ngModel.previousValue) {
      this.updateValue();
    }
  }

  updateValue(): void {
    this.ngModel = this.value;
    this.ngModelChange.emit(this.ngModel);
    this.maCustomPatternOnChange.emit(this.ngModel);
  }
}
