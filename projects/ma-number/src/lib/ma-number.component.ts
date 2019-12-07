import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';

@Component({
  selector: 'ma-number',
  template: `
  <input class="field" type="number" [name]="name" [id]="id ? id : 'id'"  [(ngModel)]="value" [disabled]="disabled" [readonly]="readonly"
  [required]="required" [placeholder]="placeholder ? placeholder : 'Please enter'" (keypress)="onKeyPress($event)">
  `,
  styles: [],
  providers: [MakeProvider(MaNumberComponent)]
})
export class MaNumberComponent extends MaInputComponent implements OnInit, OnChanges {
  @Input() ngModel: number;
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() maxLength: string;
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
    if (event.target.value.length === this.maxLength) { return false; }
  }
}
