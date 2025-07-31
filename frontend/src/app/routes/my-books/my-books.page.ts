import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonCardSubtitle, IonCardHeader, IonCard, IonCardTitle, IonRow, IonGrid, IonButtons, IonButton } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { Book } from 'src/app/model/book';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MainStoreService } from 'src/app/services/main-store.service';

@Component({
  selector: 'app-my-books',
  templateUrl: './my-books.page.html',
  styleUrls: ['./my-books.page.scss'],
  standalone: true,
  imports: [IonGrid, IonRow, IonCardTitle, IonCard, IonCardHeader, IonCardSubtitle, IonCol, IonContent, CommonModule, FormsModule]
})


export class MyBooksPage implements OnInit {

  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private mainStore = inject(MainStoreService)
  private apiUrl = environment.apiUrl;

  books: Book[] = [
    //{
    //  id: 0,
    //  name: 'Book Name',
    //  author: 'Author Name',
    //  state: 'available'
    //}
  ];

  constructor() { }

  async ngOnInit() {
    
    await this.loadBooks();
  
  }

  private tokenObject = this.mainStore.token();

  async loadBooks() {
    
    try {
      
      const data = await firstValueFrom(
        this.httpClient.get<Book[]>(this.apiUrl + 'books/my-books', { 
          headers : { "Authorization" : "Bearer " + this.tokenObject } 
        }
      ));
      
      this.books = data;
    
    } catch (error) {
      
      console.error('No se pudieron cargar libros', error);

    }

  }

  goToBook(bookId: number) {
    this.router.navigate(['/books', bookId]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

}
