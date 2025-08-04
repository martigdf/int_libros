import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appPassword]',
  providers: [{ provide: NG_VALIDATORS, useExisting: AppPasswordDirective, multi: true }]
})
export class AppPasswordDirective implements Validator {

  @Input('appPasswordMin') minLength: number = 6;

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    if (!value) return null;

    const errors: ValidationErrors = {};

    if (value.length < this.minLength) {
      errors['passwordLength'] = { requiredLength: this.minLength, actualLength: value.length };
    }
    if (!/[A-Z]/.test(value)) {
      errors['passwordUpper'] = true;
    }
    if (!/[0-9]/.test(value)) {
      errors['passwordNumber'] = true;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors['passwordSpecial'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  }

  constructor() { }

}
