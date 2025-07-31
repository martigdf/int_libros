import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/model/user';
import { Book } from 'src/app/model/book';
import { IonicModule } from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MainStoreService } from 'src/app/services/main-store.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class HomePage  implements OnInit {
  private httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private mainStore = inject(MainStoreService);
  private tokenObject = this.mainStore.token();

  public books = signal<Book[]>([]);
  public user: User = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(private router: Router) { }

  async ngOnInit() {
    this.allBooks();
  }

  async allBooks(){
    try {
      const data = await this.httpClient
        .get<Book[]>(`${this.apiUrl}books`)
        .toPromise();

      if (data) this.books.set(data);
    } catch (error) {
      console.error('Error al cargar los libros', error);
    }
  }

  verUsuariosList() {
    this.router.navigate(['/usuarios-listado']);
  }

  publicarLibro() {
    this.router.navigate(['/publish-book']);
  }

  modificarUsuario(id: string) {
    this.router.navigate([`/modify-user`, id]);
  }

  perfilUsuario(id: string) {
    this.router.navigate(['/user-profile', id]);
  }

  myBooks() {
    this.router.navigate(['/my-books']);
  }

  viewDetails(bookId: number) {
    this.router.navigate([`/books/${bookId}`]);
  }
}
