import { Component, inject, OnInit, signal, resource } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Book } from 'src/app/model/book';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BookService } from 'src/app/services/book.service';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-books',
  templateUrl: './my-books.page.html',
  styleUrls: ['./my-books.page.scss'],
  standalone: true,
  imports: [ IonicModule, CommonModule, FormsModule]
})


export class MyBooksPage implements OnInit {
  private router = inject(Router);
  private bookService = inject(BookService);

  books = signal<Book[]>([]);

  constructor() { addIcons({ 'trash-outline': trashOutline }); }

  async ngOnInit() {
    this.loadBooks.reload();
  }

  loadBooks = resource<Book[],unknown>({
    loader: async () => {
      const data = await this.bookService.userBooks();
      this.books.set(data);
      return data;
    }
  });

  async deleteBook(bookId: number) {
    const confirmado = confirm('¿Estás seguro de que deseas eliminar este libro?');
    if (!confirmado) return;
    try {
      await this.bookService.deleteBookAsUser(bookId);
      this.loadBooks.reload();
    } catch (error) {
      console.error('Error al eliminar el libro', error);
    }
  }

  ionViewWillEnter() {
    this.loadBooks.reload();
  }
  

  goToBook(bookId: number) {
    this.router.navigate(['/books', bookId]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

}
