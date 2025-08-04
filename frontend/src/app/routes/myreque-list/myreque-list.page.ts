import { Component, OnInit, resource, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestsService } from 'src/app/services/request.service';
import { Request } from 'src/app/model/request';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-myreque-list',
  templateUrl: './myreque-list.page.html',
  styleUrls: ['./myreque-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MyrequeListPage implements OnInit {

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.sentRequests.reload();
  }
  
  private requestService = inject(RequestsService);

  sentRequests = resource<Request[], unknown>({
    loader: async() => {
      const data = await this.requestService.getSentRequests();
      return data;
    }
  });

  async cancelarSolicitud(id: number) {
    try {
      await this.requestService.responderSolicitud(id, 'cancelled'); 
      this.sentRequests.reload();
    } catch (err) {
      console.error('Error al cancelar solicitud:', err);
    }
  }

  trackById(index: number, item: Request) {
    return item.id;
  }

  constructor() { }
}
