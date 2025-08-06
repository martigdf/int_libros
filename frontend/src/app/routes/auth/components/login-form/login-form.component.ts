import { Component, output, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonCol, IonRow, IonInput, IonButton, IonGrid, IonContent, IonText } from "@ionic/angular/standalone";
import { Login  } from 'src/app/model/user';
import { Router } from '@angular/router';
import { AppEmailDirective } from 'src/app/validators/app-email.directive';
import { ErrorMessagePipe } from 'src/app/pipes/error-message.pipe';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  imports: [IonCol, IonRow, IonInput, IonButton, FormsModule, IonGrid, IonContent, AppEmailDirective, ErrorMessagePipe ],
})

export class LoginFormComponent {

  @Input() model: Login = { email: '', password: '' };

  public submitted = output<Login>();

  email = signal<string>('');
  password = signal<string>(''); 

  constructor(private router: Router) {}

  async onSubmit() {

    this.submitted.emit(this.model);

  }

  async register() { 
    this.router.navigate(['/register']);
  }

  // alert(`Username: ${this.username()}, Password: ${this.password()}`);

}
