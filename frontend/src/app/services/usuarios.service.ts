import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User, UserPost } from '../model/user';
import { firstValueFrom } from 'rxjs';
import { MainStoreService } from './main-store.service';
import { signal, effect } from '@angular/core';
import { PutUser } from '../model/user';

@Injectable({
  providedIn: 'root'
})

export class UsuariosService {

  private apiUrl = environment.apiUrl
  private httpClient = inject(HttpClient);
  private mainStore = inject(MainStoreService);

  public id = signal<User | undefined>(undefined);

  async getAll(): Promise<User[]> {
    return firstValueFrom(this.httpClient.get<User[]>(this.apiUrl + "users/all"))
  }

  getUserId(): User | undefined {
    return this.id();
  }

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

  async putUser(id: string, data: PutUser) {
    const url = `${this.apiUrl}users/${id}`;
    return await firstValueFrom(this.httpClient.put<PutUser>(url, data));
  }

  async getById(id_usuario:number){
    const token = this.mainStore.token(); 
    return firstValueFrom(this.httpClient.get<User>(this.apiUrl+"users"+"/"+id_usuario,
      {
      headers: { Authorization: `Bearer ${token}` }
    }));
  }

  async deleteUser(id: string) {
    return await firstValueFrom(this.httpClient.delete(`${this.apiUrl}admin/users/${id}`, {
      headers: { Authorization: `Bearer ${this.mainStore.token()}`
      }
    }));
  }
  
  constructor() { }

}
