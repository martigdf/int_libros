import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appEmail]',
  providers: [{ provide: NG_VALIDATORS, useExisting: AppEmailDirective, multi: true }]
})
export class AppEmailDirective implements Validator {

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(control.value) ? null : { email: true };
  }

  constructor() { }

}
