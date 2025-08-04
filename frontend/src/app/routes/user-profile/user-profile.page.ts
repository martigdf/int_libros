import { Component, inject, OnInit, computed } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainStoreService } from 'src/app/services/main-store.service';
import { AdminService } from 'src/app/services/admin.service';
import { PhotoService } from 'src/app/services/photo.service';
import { PutUser } from 'src/app/model/user';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  imports: [IonicModule, CommonModule],
  styleUrls: ['./user-profile.page.scss'],
  standalone: true
})

export class UserProfilePage implements OnInit {

  private usuariosService = inject(UsuariosService);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);
  public mainStore = inject(MainStoreService);
  private adminService = inject(AdminService);
  private photoService = inject(PhotoService);

  public user = signal<any | null>(null);
  public userId = computed(() => this.mainStore.usuario()?.id ?? '');
  public userPhoto = signal<string | undefined>("https://ionicframework.com/docs/img/demos/avatar.svg")

  async ngOnInit() {

    const current = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (current?.id) {
      const data = await this.usuariosService.getById(current.id);
      this.user.set(data);

      if (data.photo !== '') {

        this.userPhoto.set(data.photo)

      }
      
    }

  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  async takePhoto() {

    const webPath = await this.photoService.takePhoto();
    this.userPhoto.set(webPath);

    this.usuariosService.submitPhoto(webPath || '');

  }

  async modifyData() {

    //Agregar formularios a la página

    //Código al confirmar:

    const data: PutUser = {};

    //this.usuariosService.putUser(this.userId(), data);

  }

  async deleteSelf() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres eliminar esta cuenta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              // Borrar usuario - metodo para admin y usuario propio
              await this.adminService.deleteUser(this.user()?.id);
              this.mainStore.clearAuth();
              this.router.navigate(['/login']);
            } catch (error) {
              console.error('Error al eliminar el usuario:', error);
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
