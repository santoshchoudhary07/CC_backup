import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators, NgControl, Validator } from '@angular/forms';

import { ControlValueAccessor } from './control-value-accessor';

@Component({
  selector: 'ma-password',
  template: `
  <input class="field" type="password" #input (input)="onChange($event.target.value)" [placeholder]="placeholder ? placeholder : 'Please enter'"
  [(ngModel)]="ngModel" [required]="required" [disabled]="disabled" [name]="name" [readonly]="readonly" [id]="id">
  `,
  styles: [],
})
export class MaPasswordComponent implements ControlValueAccessor, Validator, OnInit {
  @ViewChild('input', { static: true }) input: ElementRef;
  @Input() placeholder: string;
  @Input() name: string;
  @Input() id: string;
  @Input() ngModel: string;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() readonly: boolean;
  @Output() ngModelChange = new EventEmitter<string>();
  @Output() maPasswordOnChange = new EventEmitter<string>();

  pattern: string;
  initialized: boolean;

  constructor(private controlDir: NgControl) {
    this.controlDir.valueAccessor = this;
    this.pattern = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$";
  }

  ngOnInit(): void {
    this.initialized = true;
    const control = this.controlDir.control;
    const validators: ValidatorFn[] = control.validator ? [control.validator] : [];
    if (this.pattern) {
      validators.push(Validators.pattern(this.pattern));
    }
    control.setValidators(validators);
    control.updateValueAndValidity();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized && changes['ngModel'] && changes['ngModel'].currentValue != changes['ngModel'].previousValue) {
      this.updateValue();
    }
  }

  updateValue(): void {
    this.ngModelChange.emit(this.ngModel);
    this.maPasswordOnChange.emit(this.ngModel);
  }

  validate(c: AbstractControl): ValidationErrors {
    const validators: ValidatorFn[] = [];
    if (this.pattern) {
      validators.push(Validators.pattern(this.pattern));
    }

    return validators;
  }

  writeValue(obj: any): void {
    this.input.nativeElement.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onChange(value: any) { }

  onTouched() { }
}