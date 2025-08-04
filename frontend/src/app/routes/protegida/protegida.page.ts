import { Component, inject, OnInit, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { User } from 'src/app/model/user';
import { MainStoreService } from 'src/app/services/main-store.service';

@Component({
  selector: 'app-protegida',
  imports: [IonicModule],
  templateUrl: './protegida.page.html',
  styleUrls: ['./protegida.page.scss'],
})
export class ProtegidaPage  implements OnInit {

  public usuario = signal<User | null>(null);
  public mainStore = inject(MainStoreService);

  constructor() { }

  ngOnInit() {}

}
