import { Component, inject, OnInit, resource, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from "@ionic/angular";
import { User } from 'src/app/model/user';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin.service';
import { MainStoreService } from 'src/app/services/main-store.service';

const socket = new WebSocket("wss://10.4.200.71/backend/")

@Component({
  selector: 'app-usuarios-listado',
  templateUrl: './usuarios-listado.page.html',
  styleUrls: ['./usuarios-listado.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, IonicModule]
})

export class UsuariosListadoPage implements OnInit {

  private alertCtrl = inject(AlertController);
  private adminService = inject(AdminService);
  private mainStore = inject(MainStoreService);

  public userId = signal<string | null>(this.mainStore.userId());
  
  public usuariosSignal = resource<User[], unknown>({

    loader : () => this.adminService.getAllUsersAsAdmin()
  
  });

  // Getter para filtrar usuario loggeado
  get usuariosFiltrados(): User[] {
    const data = this.usuariosSignal.value();
    if (!data) return [];
    return data.filter(u => u.id !== this.userId())
  }

  constructor(private router: Router) { }

  ngOnInit() {
  
    socket.addEventListener("open", (event) => {

      console.log("Conexión establecida")

    })

    socket.addEventListener("message", (event) => {
      
      if (event.data == 'usuario') {

        this.usuariosSignal.reload();

      }
      
    })

  }

  modificarUsuario(id: string) {
    this.router.navigate([`/panel-admin/modify-user`, id]);
  }

  async eliminarUsuario(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres eliminar este usuario?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.adminService.deleteUser(id);
              this.usuariosSignal.reload();
            } catch (error) {
              console.error('Error al eliminar usuario', error);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  ionViewWillEnter() {
    this.usuariosSignal.reload();
  }

}
