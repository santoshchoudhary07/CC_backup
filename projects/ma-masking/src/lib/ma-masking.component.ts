import { Component, OnInit, Input, Output, EventEmitter, Optional, Host } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';
import { ControlContainer, NgForm } from '@angular/forms';
import { ControlValueAccessor } from './control-value-accessor';

@Component({
  selector: 'ma-masking',
  template: `
  <input class="field" type="text" ngModel [(maMaskValue)]="value" [maMask]="maskType" (blur)="onTouched()" [maKeepMask]="!unMaskValue" [id]="id"
  [name]="name" [disabled]="disabled" [required]="required" [readonly]="readOnly" [placeholder]="placeholder ? placeholder : ''"
  (unMask)="unMask($event)">
  `,
  styles: [],
  providers: [MakeProvider(MaMaskingComponent)]

})
export class MaMaskingComponent extends MaInputComponent implements OnInit, ControlValueAccessor {
  @Input() ngModel: any;
  @Input() maskType: string;
  @Input() unMaskValue: boolean;
  @Input() disabled: boolean;
  @Input() readOnly: boolean;
  @Input() required: boolean;
  @Input() placeholder: string;
  @Input() id: string;
  @Input() name: string;
  @Input() formControlName: string;
  @Output() onMaskChange = new EventEmitter<string>();
  @Output() ngModelChange = new EventEmitter<string>();
  form: any;
  formControlResetRequired: boolean;

  constructor(@Optional() @Host() public parent: ControlContainer) {
    super();
  }

  ngOnInit(): void {
    this.formControlResetRequired = true;
    this.controlMarkAsPristine();
  }

  controlMarkAsPristine(): void {
    setTimeout(() => {
      this.form = (this.parent as NgForm);
      if (this.formControlName) {
        if (this.formControlResetRequired && this.form && this.form.form.controls[this.formControlName ? this.formControlName : this.name]) {
          this.form.form.controls[this.formControlName ? this.formControlName : this.name].markAsPristine();
          this.formControlResetRequired = false;
        }
      } else {
        if (this.formControlResetRequired && this.form && this.form.controls[this.formControlName ? this.formControlName : this.name]) {
          this.form.controls[this.formControlName ? this.formControlName : this.name].markAsPristine();
          this.formControlResetRequired = false;
        }
      }
    }, 100);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onTouched() { }

  unMask(value: string): void {
    this.ngModelChange.emit(value);
    this.onMaskChange.emit(value);
  }
}
