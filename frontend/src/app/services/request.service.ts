import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import { RequestPost, Request } from '../model/request';

export interface RequestResponse {
  message: string;
  requestId: number;
}

@Injectable({ providedIn: 'root' })
export class RequestsService {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public lastRequest = signal<RequestResponse | null>(null);
  
  async createRequest(data: RequestPost): Promise<RequestPost> {
    return await firstValueFrom(this.http.post<RequestPost>(`${this.apiUrl}requests`, data));
  }

  async getSentRequests(): Promise<Request[]> {
    return await firstValueFrom(this.http.get<Request[]>(`${this.apiUrl}requests/sent`));
  }

  async getReceivedRequests(): Promise<Request[]> {
    return await firstValueFrom(this.http.get<Request[]>(`${this.apiUrl}requests/received`));
  }

  responderSolicitud(id: number, state: 'accepted' | 'declined' | 'cancelled'): Promise<any> {
    return this.http.patch(`${this.apiUrl}requests/${id}/response`, { state }).toPromise();
  }

  confirmPickup(id: number): Promise<any> {
    return this.http.patch(`${this.apiUrl}requests/${id}/confirm-pickup`, {}).toPromise();
  }

  confirmReturn(id: number): Promise<any> {
    return this.http.patch(`${this.apiUrl}requests/${id}/confirm-return`, {}).toPromise();
  }

}