import { Component, OnInit, inject, resource, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestsService } from 'src/app/services/request.service';
import { Request } from 'src/app/model/request';  
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-myreceived-list',
  templateUrl: './myreceived-list.page.html',
  styleUrls: ['./myreceived-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MyreceivedListPage implements OnInit {

  private requestService = inject(RequestsService);

  allReceived = signal<Request[]>([]);
  pendingReceived = signal<Request[]>([]);
  acceptedRequests = signal<Request[]>([]);
  confirmados = signal<{ [key: number]: boolean }>({});

  receivedRequests = resource<Request[], unknown>({
    loader: async () => {
      const data = await this.requestService.getReceivedRequests();
      this.allReceived.set(data);
      this.pendingReceived.set(data.filter(req => req.state === 'pending'));
      this.acceptedRequests.set(data.filter(req => req.state === 'accepted'));
      return data;
    }
  });

  responderSolicitud(id: number, state: 'accepted' | 'declined') {
    console.log(`🔹 Respondiendo solicitud ${id} con estado ${state}`);
    this.requestService.responderSolicitud(id, state)
      .then(resp => {
        console.log('Respuesta backend responderSolicitud:', resp);
        this.receivedRequests.reload();
      })
      .catch(err => console.error('Error al responder solicitud:', err));
  }
  
  async confirmPickup(id: number) {
    console.log(`Enviando confirmación de retiro para solicitud ${id}`);
    try {
      const resp = await this.requestService.confirmPickup(id);
      console.log('Respuesta backend confirm-pickup:', resp);
      this.confirmados.update(prev => ({ ...prev, [id]: true }));
      this.receivedRequests.reload();
    } catch (err) {
      console.error('Error al confirmar retiro:', err);
    }
  }

  async confirmReturn(id: number) {
    try {
      await this.requestService.confirmReturn(id);
      this.receivedRequests.reload();
    } catch (err) {
      console.error('Error al confirmar devolución:', err);
    }
  }

  constructor() { }

  ngOnInit() {
  }

}
