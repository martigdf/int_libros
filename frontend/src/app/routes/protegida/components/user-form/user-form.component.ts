import { Component, input, output, signal, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PutUser, User } from 'src/app/model/user';
import { MainStoreService } from 'src/app/services/main-store.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [IonicModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent{

  private mainStore = inject(MainStoreService);

  public isAdmin = signal<boolean>(this.mainStore.isAdmin())
  public userId = signal<string | null>(this.mainStore.userId());

  public totalRoles = input<string[]>(['admin', 'user']);
  public user = input<User | null>(null) 

  public name = signal('');
  public lastname = signal('');
  public email = signal('');
  public role = signal<'admin' | 'user'>('user');

  public changed = output<PutUser>();

  ngOnInit() {
    const u = this.user();
    if (u) {
      this.name.set(u.name);
      this.lastname.set(u.lastname);
      this.email.set(u.email);
      this.role.set(u.role as 'admin' | 'user');
    }
  }

  onSubmit(){
    const payload : PutUser = {}
    if (this.name()) payload.name = this.name();
    if (this.lastname()) payload.lastname = this.lastname();
    if (this.email() && this.email() !== this.user()?.email) {
      payload.email = this.email();
    }
    if (this.role() !== this.user()?.role) {
      const selectedRole = this.totalRoles().find(role => role === this.role());
      if (selectedRole === 'admin' || selectedRole === 'user') {
        payload.role = selectedRole as 'admin' | 'user';
      }
    }
    console.log("Payload enviado:", payload);
    this.changed.emit(payload);
  }
}
