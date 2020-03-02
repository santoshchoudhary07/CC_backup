import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges, AfterViewChecked, ChangeDetectorRef, Optional, Host } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-inputs';
import { ControlValueAccessor } from './control-value-accessor';
import { ControlContainer, NgForm } from '@angular/forms';

@Component({
  selector: 'ma-text',
  template: `
  <input type="text" [name]="name" [id]="id ? id : ''" class="field" [(ngModel)]="value" [placeholder]="placeholder ? placeholder : ''" [disabled]="disabled"
  [readonly]="readonly" [required]="required" [maxlength]="maxlength" (blur)="onTouched();blur.emit()">
  `,
  styles: [],
  providers: [MakeProvider(MaTextComponent)]

})
export class MaTextComponent extends MaInputComponent implements OnInit, OnChanges, AfterViewChecked, ControlValueAccessor {
  @Input() ngModel: string;
  @Input() placeholder: string;
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() id: string;
  @Input() name: string;
  @Input() maxlength: number;
  @Input() formControlName: any;
  @Output() ngModelChange = new EventEmitter<string>();
  @Output() maTextOnChange = new EventEmitter<string>();
  @Output() blur = new EventEmitter<any>();

  initialized: boolean;
  form: any;
  formControlResetRequired: boolean;
  constructor(private changeDetectorRef: ChangeDetectorRef, @Optional() @Host() public parent: ControlContainer) {
    super();
  }

  ngOnInit() {
    this.initialized = true;
    this.formControlResetRequired = true;
    this.controlMarkAsPristine();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized && changes.ngModel && changes.ngModel.currentValue !== changes.ngModel.previousValue) {
      this.updateValue();
    }
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
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
