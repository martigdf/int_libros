import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { inject } from '@angular/core';
import { Genre } from 'src/app/model/genre';
import { firstValueFrom } from 'rxjs';
import { BookPost } from 'src/app/model/book';
import { HttpHeaders } from '@angular/common/http';
import { Book } from 'src/app/model/book';

@Injectable({
  providedIn: 'root'
})

export class BookService {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() { }

  // Método para obtener los géneros de libros
  async getGenres(): Promise<Genre[]> {
    return await firstValueFrom(this.http.get<Genre[]>(`${this.apiUrl}books/genres`));
  }

  // Método para publicar un libro
  async publishBook(book: BookPost): Promise<any> {
    const token = localStorage.getItem('authToken');
    console.log('TOKEN ENVIADO:', token);
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return await firstValueFrom(
      this.http.post(`${this.apiUrl}books/publish`, book, { headers })
    );
  }

  // Método para obtener todos los libros
  async getAllBooks(): Promise<Book[]> {
    return firstValueFrom(this.http.get<Book[]>(`${this.apiUrl}/`));
  }
}
