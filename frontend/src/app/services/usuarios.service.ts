import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User, UserPost } from '../model/user';
import { firstValueFrom } from 'rxjs';
import { MainStoreService } from './main-store.service';
import { signal } from '@angular/core';
import { UserPatch } from '../model/user';

@Injectable({
  providedIn: 'root'
})

export class UsuariosService {

  private apiUrl = environment.apiUrl
  private httpClient = inject(HttpClient);
  private mainStore = inject(MainStoreService);

  public id = signal<User | undefined>(undefined);

  // Método para obtener el usuario actual
  async getAll(): Promise<User[]> {
    return firstValueFrom(this.httpClient.get<User[]>(this.apiUrl + "users/all"))
  }

  // Método para obtener el usuario por ID
  getUserId(): User | undefined {
    return this.id();
  }

  // Metodo para crear un usuario
  async postUser(data: UserPost) {
    const url = this.apiUrl + "users/register";
    const userConRol: UserPost = {
      ...data,
      role: 'user'
    };
    console.log("Datos enviados al backend:", userConRol);

    return await firstValueFrom(
      this.httpClient.post<User>(url, userConRol)
    );
  }

  // Método para actualizar un usuario
  async patchUser(id: string, data: UserPatch) {
    const url = `${this.apiUrl}users/${id}`;
    return await firstValueFrom(this.httpClient.patch<UserPatch>(url, data));
  }

  // Método para obtener el usuario por ID
  async getById(userId: number) {

    const user = await firstValueFrom(this.httpClient.get<User>(this.apiUrl + "users/" + userId))

    user.photo = this.apiUrl + 'photos/users/' + userId

    return user;
  
  }

  async getUsernameById(userId: number) {

    const user = await this.getById(userId);

    return user.username


  }

  // Metodo para verificar credenciales para directiva
  async verificarCredenciales(email: string, password: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(this.httpClient.post(this.apiUrl + "auth/login", 
        { email, password }, { observe: 'response' }));
      return res.status === 200;
    } catch {
      return false;
    }
  }

  async submitPhoto(photo: string) {

    if ( this.mainStore.userId() === undefined || photo === '' ) {

      return

    }

    const response = await fetch(photo);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('file', blob, this.mainStore.userId() + '.jpg')

    await firstValueFrom(this.httpClient.put(this.apiUrl + 'photos/users/' + this.mainStore.userId(), formData));

  }

  getPhoto(userId: string) {

    return (this.apiUrl + 'photos/users/' + userId)

  }
  
  constructor() { }

}
