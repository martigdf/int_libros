import { Component, inject, OnInit, computed } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MainStoreService } from 'src/app/services/main-store.service';
import { AdminService } from 'src/app/services/admin.service';
import { PhotoService } from 'src/app/services/photo.service';
import { UserPatch } from 'src/app/model/user';
import { ErrorMessagePipe } from 'src/app/pipes/error-message.pipe';
import { addIcons } from 'ionicons';
import { closeOutline, pencilOutline, checkmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  imports: [IonicModule, CommonModule, FormsModule, ErrorMessagePipe],
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

  public name = signal<string>('');
  public lastName = signal<string>('');
  public username = signal<string>('');

  public modifyingUsername = signal<boolean>(false);
  public modifyingName = signal<boolean>(false);
  public modifyingLastName = signal<boolean>(false);

  public newUsername: string = '';
  public newName: string = '';
  public newLastName: string = '';

  constructor() {

    addIcons({'pencil-outline': pencilOutline, 'checkmark-outline': checkmarkOutline, 'close-outline': closeOutline});

  }

  async ngOnInit() {

    const current = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (current?.id) {
      const data = await this.usuariosService.getById(current.id);
      this.user.set(data);

      this.name.set(this.user().name);
      this.lastName.set(this.user().lastname);
      this.username.set(this.user().username);

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

  modifyUsername() {

    this.modifyingUsername.set(true);

  }

  cancelUsername() {

    this.modifyingUsername.set(false);

  }

  async submitUsername() {

    const newUsername = this.newUsername;

    if (newUsername === '') {

      this.modifyingUsername.set(false);

      return

    }

    console.log(newUsername);

    const data: UserPatch = {username: newUsername};

    await this.usuariosService.patchUser(this.userId(), data);

    this.username.set(newUsername);

    this.modifyingUsername.set(false);
    
  }

  modifyName() {

    this.modifyingName.set(true);
  }

  cancelName() {

    this.modifyingName.set(false);

  }

  async submitName() {

    const newName = this.newName;

    if (newName === '') {

      this.modifyingName.set(false);

      return

    }

    console.log(newName);

    const data: UserPatch = {name: newName};

    await this.usuariosService.patchUser(this.userId(), data);

    this.name.set(newName);

    this.modifyingName.set(false);

  }

  modifyLastName() {

    this.modifyingLastName.set(true);

  }

  cancelLastName() {

    this.modifyingLastName.set(false);
    
  }

  async submitLastName() {

    const newLastName = this.newLastName;

    if (newLastName === '') {

      this.modifyingLastName.set(false);

      return

    }

    console.log(newLastName);

    const data: UserPatch = {lastname: newLastName};

    await this.usuariosService.patchUser(this.userId(), data);

    this.lastName.set(newLastName);

    this.modifyingLastName.set(false);

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
