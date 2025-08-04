import { Component, inject, OnInit, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from "@ionic/angular";
import { User } from 'src/app/model/user';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin.service';

const socket = new WebSocket("ws://localhost/backend/")

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

  
  public usuariosSignal = resource<User[], unknown>({

    loader : () => this.adminService.getAllUsersAsAdmin()
  
  });

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
