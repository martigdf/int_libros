import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PlaceService {

    private httpClient = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    
    constructor() { }

    async getPlacesFromDepartment(departamento: string) {

        const localidades = await firstValueFrom(this.httpClient.get<string[]>(this.apiUrl + '/places/' + departamento));

        console.log(localidades)

        return localidades;

    } 

}
