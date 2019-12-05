import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, AfterViewChecked } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';
import { isNumber, isBoolean } from 'util';
import { ControlValueAccessor } from './control-value-accessor';

@Component({
  selector: 'ma-checkbox',
  template: `
  <div class="checkbox">
    <input type="checkbox" [value]="checkBoxValue" [ngModel]="value === checkBoxValue ? value : null"
      (ngModelChange)="value === checkBoxValue ? (checkbox = true) : (checkbox = false)" [disabled]="disabled"
      [readonly]="readonly" [required]="required" [name]="name" [id]="id ? id : ''"
      (change)="checkBoxChange($event)" (click)="this.checked = !readonly;" (blur)="onTouched()">
    <label [for]="id ? id : ''">
      <ng-content></ng-content>
    </label>
  </div>
  `,
  styles: [],
  providers: [MakeProvider(MaCheckboxComponent)]
})
export class MaCheckboxComponent extends MaInputComponent implements OnInit, AfterViewChecked, ControlValueAccessor {
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

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
  }

  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  checkBoxChange(event: any): void {
    if (!this.readonly && !this.disabled) {
      this.checkbox = event.target.checked;
      this.updateValue(event.target.value);
    }
    this.onTouched();
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onTouched() { }

  private updateValue(checked: string): void {
    const value = (isNumber(this.checkBoxValue) ? +checked : (isBoolean(this.checkBoxValue) ? JSON.parse(checked) : checked));
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
