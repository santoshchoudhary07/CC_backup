import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';
import { isNumber, isBoolean } from 'util';

@Component({
  selector: 'ma-checkbox',
  template: `
  <div class="checkbox">
  <input type="checkbox" [value]="checkBoxValue" [ngModel]="value === checkBoxValue ? value : null"
  (ngModelChange)="value === checkBoxValue ? (checkbox = true) : (checkbox = false)" [disabled]="disabled" [readonly]="readonly" [required]="required" [name]="name ? name : 'check-name'"
    [id]="id ? id : 'check-id'" (change)="checkBoxChange($event)" (click)="this.checked = !readonly;">
  <label [for]="id ? id : 'check-id'"><ng-content></ng-content></label>
</div>
  `,
  styles: [],
  providers: [MakeProvider(MaCheckboxComponent)]
})
export class MaCheckboxComponent extends MaInputComponent implements OnInit {
  @Input() ngModel: any;
  @Input() checkBoxValue: any;
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() id: string;
  @Input() name: string;
  @Input() formControlName: any;
  @Output() ngModelChange = new EventEmitter<boolean>();
  @Output() maCheckBoxChange = new EventEmitter<boolean>();

  checked: boolean;
  checkbox: boolean;

  constructor() {
    super();
  }

  ngOnInit() {
  }

  checkBoxChange(event: any): void {
    if (!this.readonly && !this.disabled) {
      this.checkbox = event.target.checked;
      this.updateValue(event.target.value);
    }
  }

  private updateValue(checked: string): void {
    let value = (isNumber(this.checkBoxValue) ? +checked : (isBoolean(this.checkBoxValue) ? JSON.parse(checked) : checked));
    if (this.formControlName) {
      this.value = this.checkedValue(value);
    }
    this.ngModel = this.checkedValue(value);
    this.ngModelChange.emit(this.ngModel);
    this.maCheckBoxChange.emit(this.ngModel);
  }

  private checkedValue(value: any): any {
    return (this.checkbox ? value : (isBoolean(value) ? false : null))
  }
}
