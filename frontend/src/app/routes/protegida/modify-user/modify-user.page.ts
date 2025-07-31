import { Component, OnInit,inject, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from "@ionic/angular";
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ActivatedRoute } from '@angular/router';
import { UserFormComponent } from "../components/user-form/user-form.component";
import { User } from 'src/app/model/user';
import { PutUser } from 'src/app/model/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modify-user',
  templateUrl: './modify-user.page.html',
  styleUrls: ['./modify-user.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, UserFormComponent]
})
export class ModifyUserPage implements OnInit {

  private usuarioService = inject(UsuariosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public user: User | null = null;
  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadUsuario(id);
  }

  private async loadUsuario(id: string) {
    this.user = await this.usuarioService.getById(parseInt(id));
  }

  async handleSave(payload: PutUser) {
    if (!this.user) return;
    await this.usuarioService.putUser(this.user.id, payload as PutUser);
    this.router.navigate(['/user-profile/:id']).then(() => {
    window.location.reload();
  });
  }
}
