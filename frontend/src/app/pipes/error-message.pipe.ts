import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Pipe({
  name: 'errorMessage'
})
export class ErrorMessagePipe implements PipeTransform {

  transform(errors: ValidationErrors|null, ...args: string[]): string {
    console.log({args});
    if (!errors) return "";
    if (errors["required"]) return "El campo " + args[0] + " es requerido." 
    if (errors["appReservado"]) return "El nombre seleccionado está reservado." 
    if (errors["email"]) return "Debe ingresar un correo válido."
    if (errors["minlength"]) return `La contraseña debe tener al menos ${errors["minlength"].requiredLength} caracteres.`
    if (errors["mismatch"]) return "Las contraseñas no coinciden."
    if (errors["passwordLength"]) 
      return `La contraseña debe tener al menos ${errors["passwordLength"].requiredLength} caracteres.`;
    if (errors["passwordUpper"]) 
      return "La contraseña debe contener al menos una letra mayúscula.";
    if (errors["passwordNumber"]) 
      return "La contraseña debe contener al menos un número.";
    if (errors["passwordSpecial"]) 
      return "La contraseña debe contener al menos un carácter especial.";

    return "Error desconocido";
  }
}