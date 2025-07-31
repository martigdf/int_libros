import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonItem } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-menu-loans',
  templateUrl: './menu-loans.page.html',
  styleUrls: ['./menu-loans.page.scss'],
  standalone: true,
  imports: [IonItem, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, FormsModule, RouterLink]
})
export class MenuLoansPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
