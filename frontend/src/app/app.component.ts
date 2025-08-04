import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { MainStoreService } from './services/main-store.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from './model/user';
import { IonicModule } from '@ionic/angular';
import { UsuariosService } from './services/usuarios.service';

const token = localStorage.getItem('token')
const socket = new WebSocket("ws://localhost/backend/")

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule],
})
export class AppComponent {

  public mainStore = inject(MainStoreService);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  private httpClient = inject(HttpClient);

  public isHome = signal<boolean>(false);
  
  public usuario = signal<User | null>(null);
  public usuarioId = computed(() => this.mainStore.usuario()?.id ?? '');
  public userPhoto = signal<string | undefined>("https://ionicframework.com/docs/img/demos/avatar.svg")

  constructor() {
    this.router.events.subscribe(() => {
      this.isHome.set(this.router.url === '/home');
    });
  }

  async ngOnInit(){

    this.userPhoto.set(this.apiUrl + 'photos/users/' + this.usuarioId() || "https://ionicframework.com/docs/img/demos/avatar.svg")

    socket.addEventListener("message", (event) => {

      if (event.data == 'userPhoto') {

        console.log("Cambiar foto")
        
        const newPhoto = this.apiUrl + 'photos/users/' + this.usuarioId();
        this.userPhoto.set(newPhoto);

      }
      
    })

  }

  isLoggedIn(): boolean {

    return this.mainStore.token() !== null;

  }

  public isUser = computed(() => {
    const isUser = this.usuario()?.role === 'user';
    console.log('isUser:', isUser);
    return isUser;
  });


  public isAdmin = computed(() => {
    const isAdmin = this.usuario()?.role === 'admin';
    console.log('isAdmin:', isAdmin);
    return isAdmin;
  });

  async logout() {
    try {
      await this.httpClient.post(`${this.apiUrl}auth/logout`, {}, {
        headers: { Authorization: `Bearer ${this.mainStore.token()}` }
      }).toPromise();
    } catch {
      console.warn('El backend no respondió al logout, continuamos.');
    }

    this.mainStore.clearAuth();
    this.router.navigate(['/login']).then(() => {
      location.reload(); 
    });
  }

  verUsuariosList() {
    this.router.navigate(['/panel-admin/usuarios-listado']);
  }

  verLibrosList() {
    this.router.navigate(['/panel-admin/view-books']);
  }

  publicarLibro() {
    this.router.navigate(['/publish-book']);
  }

  perfilUsuario(id: string) {
    this.router.navigate(['/user-profile', id]);
  }

  misLibros() {
    this.router.navigate(['/my-books']);
  }

  misSolicitudes() {
    this.router.navigate(['/myreque-list']);
  }

  misRecibidas() {
    this.router.navigate(['/myreceived-list']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

}
