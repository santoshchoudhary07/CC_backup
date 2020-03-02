import { Component, OnInit, Input, Output, EventEmitter, Optional, Host } from '@angular/core';

import { MakeProvider, MaInputComponent } from './ma-inputs';
import { ControlValueAccessor } from './control-value-accessor';
import { ControlContainer, NgForm } from '@angular/forms';

@Component({
  selector: 'ma-toggle',
  template: `
 <div class="checkbox-toggle">
    <div class="form-controls">
        <input type="checkbox" name="{{name}}" id="{{id}}}" [(ngModel)]="value" [disabled]="disabled" [readonly]="readonly" [required]="required">
        <label for="{{id}}" (click)="toggle();">
            <ng-container *ngIf="toggleTextName && toggleTextName.length>0; else elseTemplate">
                <span *ngFor="let d of toggleTextName">{{d}}</span>
            </ng-container>
            <ng-template #elseTemplate>
                <span>No</span>
                <span>Yes</span>
            </ng-template>
        </label>
    </div>
</div>
  `,
  providers: [MakeProvider(MaToggleComponent)]
})
export class MaToggleComponent extends MaInputComponent implements OnInit, ControlValueAccessor {
  @Input() ngModel: boolean;
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() toggleTextName: string[];
  @Input() name: string;
  @Input() id: string;
  @Input() required: boolean;
  @Input() formControlName: any;

  @Output() maToggleOnChange = new EventEmitter<boolean>();
  @Output() ngModelChange = new EventEmitter<boolean>();
  form: any;
  formControlResetRequired: boolean;
  constructor(@Optional() @Host() public parent: ControlContainer) { super(); }

  ngOnInit() {
    this.formControlResetRequired = true;
    this.controlMarkAsPristine();
  }

  toggle(): void {
    this.onTouched();
    if (!this.readonly && !this.disabled) {
      this.value = !this.value;
      this.updateValue();
    }
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
    this.ngModel = this.value;
    this.ngModelChange.emit(this.ngModel);
    this.maToggleOnChange.emit(this.ngModel);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onTouched() { }
}
