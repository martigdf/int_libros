import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { inject } from '@angular/core';
import { Genre } from 'src/app/model/genre';
import { firstValueFrom } from 'rxjs';
import { BookPost } from 'src/app/model/book';
import { HttpHeaders } from '@angular/common/http';
import { Book } from 'src/app/model/book';
import { MainStoreService } from './main-store.service';
import { UsuariosService } from './usuarios.service';

@Injectable({
  providedIn: 'root'
})

export class BookService {

  private mainStore = inject(MainStoreService);
  private httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private usuariosService = inject(UsuariosService);

  constructor() { }

  // Método para obtener los géneros de libros
  async getGenres(): Promise<Genre[]> {
    return await firstValueFrom(this.httpClient.get<Genre[]>(`${this.apiUrl}books/genres`));
  }

  // Método para publicar un libro
  async publishBook(book: BookPost): Promise<any> {
    const token = localStorage.getItem('authToken');
    console.log('TOKEN ENVIADO:', token);
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return await firstValueFrom(
      this.httpClient.post(`${this.apiUrl}books/publish`, book, { headers })
    );
  }

  // Método para obtener todos los libros
  async getAllBooks(): Promise<Book[]> {

    const books = await firstValueFrom(this.httpClient.get<Book[]>(this.apiUrl + 'books/'))

    console.log(books)
    
    for (const book of books) {

      book.photo = this.apiUrl + 'photos/books/' + book.id
      book.owner_username = await this.usuariosService.getUsernameById(book.owner_id)

      console.log(book.owner_username)

    }

    return books;

  }

  async getById(id: number): Promise<Book> {

    const book = await firstValueFrom(this.httpClient.get<Book>(this.apiUrl + 'books/' + id))

    book.photo = this.apiUrl + 'photos/books/' + book.id
    book.owner_username = await this.usuariosService.getUsernameById(book.owner_id)

    return book

  }
  
  // Metodo para obtener los libros de un usuario
  async userBooks(): Promise<Book[]> {

    const books = await firstValueFrom(this.httpClient.get<Book[]>(`${this.apiUrl}books/my-books`))
    
    for (const book of books) {

      book.photo = this.apiUrl + 'photos/books/' + book.id

    }

    return books;
    
  }

  // Método para eliminar un libro
  async deleteBookAsUser(id: number): Promise<any> {
    return await firstValueFrom(this.httpClient.delete(`${this.apiUrl}books/${id}`));
  }

  async submitPhoto( bookId: number, photo: string ) {

    if ( this.mainStore.userId() === undefined || photo === '' ) {

      return

    }

    const response = await fetch(photo);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('file', blob, bookId + '.jpg')

    await firstValueFrom(this.httpClient.put(this.apiUrl + 'photos/books/' + bookId, formData));

  }

  async getPhoto( book_id: number) {

    return await firstValueFrom(this.httpClient.get(this.apiUrl + 'photos/books/' + book_id));

  }

}
