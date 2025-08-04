import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})

export class AdminService {

  private httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() { }

  // Metodo para obtener todos los usuarios como admin
  async getAllUsersAsAdmin(): Promise<User[]> {
    return await firstValueFrom(this.httpClient.get<User[]>(`${this.apiUrl}admin/users`));
  }

  // Metodo para eliminar un libro siendo admin
  async deleteBookAsAdmin(id: string): Promise<void> {
    return firstValueFrom(this.httpClient.delete<void>(`${this.apiUrl}admin/books/${id}`));
  }

  // Metodo para eliminar un usuario siendo ADMIN o USUARIO PROPIO
  async deleteUser(id: string) {
    return await firstValueFrom(this.httpClient.delete(`${this.apiUrl}admin/users/${id}`));
  }
}