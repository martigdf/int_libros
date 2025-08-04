import { Component, inject, OnInit } from '@angular/core';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { MainStoreService } from 'src/app/services/main-store.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import { Login, Token, User } from 'src/app/model/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [LoginFormComponent]
})
export class LoginPage implements OnInit {

  private httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private mainStore = inject(MainStoreService);
  private router = inject(Router);

  loginData: Login = { email: '', password: '' };

  constructor(){ }

  ngOnInit(){ 
    this.loginData = { email: '', password: '' };
  }

  public async doAuth(data: Login) {
   try{
      const tokenObject: Token & { user: User }= await firstValueFrom(
        this.httpClient.post<Token & { user: User }>(this.apiUrl + "auth/login", data)
      );

      const userId = tokenObject.user.id;
      this.mainStore.setToken(tokenObject.token);

      const usuario = await firstValueFrom(
        this.httpClient.get<User>(this.apiUrl + `users/${userId}`, { headers : {"Authorization" : "Bearer " + tokenObject.token} 
      }));
      
      this.mainStore.setUser(usuario);

      // Redirige a home si es usuario - admin a panel-admin
      if (this.mainStore.isAdmin()) {
        this.router.navigate(['/panel-admin']);
      } else {
        this.router.navigate(['/home']);
      }
    }
    catch (error) {
      console.error("Login failed", error);
    }

  }

}
