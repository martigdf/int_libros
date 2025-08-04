import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, resource, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from 'src/app/model/book';
import { environment } from 'src/environments/environment.prod';
import { CommonModule } from '@angular/common';
import { RequestsService } from 'src/app/services/request.service';
import { RequestPost } from 'src/app/model/request';
import { AlertController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { MainStoreService } from 'src/app/services/main-store.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
  standalone: true,
  imports: [ CommonModule, IonicModule],
})

export class BookPage implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private requestsService = inject(RequestsService);
  private alertCtrl = inject(AlertController);
  public mainStore = inject(MainStoreService);
  public bookService = inject(BookService);
  public usuariosService = inject(UsuariosService);

  
  book = signal<any>(null);
  bookPhoto = signal<string>('');

  receiver_user_id = signal<number>(0);
  requestResult = signal<RequestPost | null>(null);
  
  public currentUserId!: number;
  
  ngOnInit() {    
  }

  // Método para cargar los detalles del libro
  loadBook = resource<Book, unknown>({
    loader : async () => {

      const bookId = Number(this.route.snapshot.paramMap.get('id'));
      const book = await this.bookService.getById(bookId);

      if (!book) {
        throw new Error('No se pudo cargar el libro');
      }

      this.book.set(book); 
      this.receiver_user_id.set(book.owner_id);

      return book!;

    }
  });

  // Metodo para solicitar un préstamo del libro
  async requestBook() {
    const currentBook = this.book();

    if (!currentBook) {
      await this.showAlert('Error', 'No se pudo obtener la información del libro.');
      return;
    }

    // Verificar si el libro está disponible
    const payload: RequestPost = {
      receiver_user_id: this.receiver_user_id(),
      books: [currentBook.id]
    };

    try {
      // Llamar al servicio para crear la solicitud
      const res = await this.requestsService.createRequest(payload);
      await this.showAlert('Éxito', 'Solicitud creada correctamente.');
      this.requestResult.set(res);
      console.log('Solicitud creada:', res);
      this.loadBook.reload();
    } catch (err) {
      console.error('Error al crear la solicitud:', err);
      await this.showAlert('Error', 'No se pudo crear la solicitud.');
    }
  }

  async goToProfile() {

    this.router.navigate(['/user-profile', this.book().owner_id]);

  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

}