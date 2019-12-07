import { Component, OnInit, Input, ElementRef, ViewChild, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { NgControl, ValidatorFn, Validators, ValidationErrors, Validator, AbstractControl } from '@angular/forms';

import { ControlValueAccessor } from './control-value-accessor';

@Component({
  selector: 'ma-email',
  template: `
  <input class="field" type="email" #input (input)="onChange($event.target.value)" [placeholder]="placeholder ? placeholder : 'Please enter'"
  [(ngModel)]="ngModel" [required]="required" [disabled]="disabled" [readonly]="readonly">
  `,
  styles: [],
})
export class MaEmailComponent implements ControlValueAccessor, Validator, OnInit {
  @ViewChild('input', { static: true }) input: ElementRef;
  @Input() placeholder: string;
  @Input() ngModel: string;
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Output() ngModelChange = new EventEmitter<string>();
  @Output() maEmailOnChange = new EventEmitter<string>();

  pattern: string;
  initialized: boolean;

  constructor(private controlDir: NgControl) {
    this.controlDir.valueAccessor = this;
    this.pattern = "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}";
    this.placeholder = "Enter Email";
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
    this.maEmailOnChange.emit(this.ngModel);
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