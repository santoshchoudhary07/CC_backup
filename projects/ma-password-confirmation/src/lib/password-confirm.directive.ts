import { Directive, Input } from '@angular/core';
import { Validator, NG_VALIDATORS, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';

@Directive({
  selector: '[match]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ConfirmPasswordDirective, multi: true }]
})

export class ConfirmPasswordDirective implements Validator {
  @Input() password: string;
  @Input() confirmPassword: string;

  constructor() {
  }

  validate(abstractControl: AbstractControl): ValidationErrors | null {
    return this.validatePassword(abstractControl as FormGroup);
  }

  validatePassword(group: FormGroup): any {
    if (group.get(this.password) && group.get(this.password).value) {
      return (group.get(this.password).value === group.get(this.confirmPassword).value)
        ? group.controls[this.confirmPassword].setErrors({ misMatch: false }) : group.get(this.confirmPassword).value
          ? group.controls[this.confirmPassword].setErrors({ misMatch: true }) : null;
    }
  }
}
