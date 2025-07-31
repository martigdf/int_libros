import { Component, input, output, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PutUser, User } from 'src/app/model/user';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [IonicModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent{

  public totalRoles = input<string[]>(['admin', 'user']);
  public user = input<User | null>(null) 

  public name = signal<string>(this.user()?.name ?? '');
  public roles = signal<string>(this.user()?.role ?? 'user');
  public last_name = signal<string>(this.user()?.last_name ?? '');
  public email = signal<string>(this.user()?.email ?? '');

  public changed = output<PutUser>();

  onSubmit(){
    const payload : PutUser = {}
    if (this.name()) payload.name = this.name();
    if (this.last_name()) payload.last_name = this.last_name();
    if (this.email() && this.email() !== this.user()?.email) {
      payload.email = this.email();
    }
    if (this.roles() !== this.user()?.role) {
      const selectedRole = this.totalRoles().find(role => role === this.roles());
      if (selectedRole === 'admin' || selectedRole === 'user') {
        payload.role = selectedRole as 'admin' | 'user';
      }
    }
    console.log("Payload enviado:", payload);
    this.changed.emit(payload);
  }
}
