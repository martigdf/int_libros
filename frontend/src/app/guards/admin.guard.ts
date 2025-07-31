import { CanActivateFn, Router } from '@angular/router';
import { MainStoreService } from '../services/main-store.service';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const mainStoreService = inject(MainStoreService);
  const router = inject(Router);

  // Verifica si el usuario tiene el rol de administrador
  if (!mainStoreService.isAdmin()) {
    console.warn('Acceso denegado: el usuario no es administrador');
    router.navigate(['/']); // Redirige a la página de inicio si no es administrador
    return false; // Bloquea el acceso si no es administrador
  }
  return true; // Permite el acceso si es administrador
};