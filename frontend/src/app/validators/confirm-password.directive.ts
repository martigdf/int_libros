import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appConfirmPassword]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ConfirmPasswordDirective, multi: true }]
})
export class ConfirmPasswordDirective implements Validator {

  @Input('appConfirmPassword') passwordInput!: string;

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.passwordInput) return null;
    return control.value === this.passwordInput ? null : { mismatch: true };
  }

  constructor() { }

}
