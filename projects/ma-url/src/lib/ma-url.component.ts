import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators, NgControl } from '@angular/forms';

@Component({
  selector: 'ma-url',
  template: `
  <input autocomplete="off" class="field" type="url" #input (input)="onChange($event.target.value)" [placeholder]="placeholder ? placeholder : 'Please enter'"
  [(ngModel)]="ngModel" [required]="required" [disabled]="disabled" [name]="name" [readonly]="readonly" [id]="id">
  `,
  styles: [],
})
export class MaUrlComponent implements OnInit {
  @ViewChild('input', { static: true }) input: ElementRef;
  @Input() ngModel: string;
  @Input() name: string;
  @Input() id: string;
  @Input() placeholder: string;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() readonly: boolean;
  @Output() ngModelChange = new EventEmitter<string>();
  @Output() maUrlOnChange = new EventEmitter<string>();

  pattern: string;
  initialized: boolean;

  constructor(private controlDir: NgControl) {
    this.controlDir.valueAccessor = this;
    this.pattern = "^http:\/\/[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+$";
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
    this.maUrlOnChange.emit(this.ngModel);
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
