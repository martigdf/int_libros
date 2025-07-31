import { effect, Injectable, signal, computed } from '@angular/core';
import { User } from '../model/user';
import { JWTPayload } from '../model/payload';

@Injectable({
  providedIn: 'root'
})
export class MainStoreService {

  constructor() { if (this.token()) {
      this.decodePayload();
    }}

  public usuario = signal<User | null>(null);

  // el token JWT
  public token = signal<string | null>(localStorage.getItem('authToken'));

  public userId = signal<string | null>(null);
  public userName = signal<string | null>(null);
  public userLastName = signal<string | null>(null);
  public userUsername = signal<string | null>(null);
  public userEmail = signal<string | null>(null);
  public userRole = signal<'admin' | 'user' | null>(null);



  public isAuthenticated = computed(() => {
    return this.usuario() !== null && this.token() !== null;
  });
  public isAdmin = computed(() => {
    return this.userRole() === 'admin';
  });
  public isUser = computed(() => {
    return this.userRole() === 'user';
  });

  public isSelfOrAdmin = computed(() => {
    if (this.isUser()) {
      return true;
    } else if (this.isAdmin()) {
      return true;
    }
    return false;
  });

  private efecto = effect(() => {
    console.log("Usuario restaurado: ", this.usuario())
  })

  private tokenEffect = effect(() => {
    console.log('Token actualizado:', this.token());
    this.decodePayload();
  });

  private decodePayload() {
    const token = this.token();
    if (!token) {
      this.userId.set(null);
      this.userName.set(null);
      this.userLastName.set(null);
      this.userUsername.set(null);
      this.userEmail.set(null);
      this.userRole.set(null);
      return;
    }
    try {
      // Extrae la segunda parte (payload) y decodificar Base64URL
      const payloadBase64 = token.split('.')[1];
      const payloadJson = decodeURIComponent(
        atob(payloadBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(payloadJson) as JWTPayload;
      const roleValue = (payload.role === 'admin' || payload.role === 'user') 
      ? payload.role 
      : 'user'; 

      // Actualiza señales 
      this.userId.set(payload.user_id);
      this.userName.set(payload.user);
      this.userLastName.set(payload.user);
      this.userUsername.set(payload.user);
      this.userEmail.set(payload.user);
      this.userRole.set(payload.role);
      console.log('Payload decodificado:', payload);

      // Actualiza usuario completo
      this.usuario.set({
        id: payload.user_id,
        name: payload.user,
        last_name: payload.user,
        username: payload.user,
        email: payload.user,
        role: roleValue
      });
    } catch (error) {
      console.error('Error al decodificar JWT payload:', error);
      this.userId.set(null);
      this.userEmail.set(null);
      this.userRole.set(null);
    }
  }

  setToken(token: string) {
    this.token.set(token);
    localStorage.setItem('authToken', token);
    if (this.token()) {
      this.decodePayload();
    }
  }

  setUser(user: User) {
    this.usuario.set(user);
    const userString = JSON.stringify(user)
    localStorage.setItem("user", userString);
  }

  clearAuth() {
    this.usuario.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    this.token.set(null);
    this.userId.set(null);
    this.userName.set(null);
    this.userLastName.set(null);
    this.userUsername.set(null);
    this.userEmail.set(null);
    this.userRole.set(null);
    console.log('Autenticación borrada');
  }
}