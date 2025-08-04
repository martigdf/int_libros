import { Component, inject, OnInit ,Signal,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Genre } from 'src/app/model/genre';
import { BookPost } from 'src/app/model/book';
import { BookService } from 'src/app/services/book.service';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PhotoService } from 'src/app/services/photo.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-publish-book',
  templateUrl: './publish-book.page.html',
  styleUrls: ['./publish-book.page.scss'],
  standalone: true,
  imports: [ IonicModule, CommonModule, FormsModule ]
})
export class PublishBookPage implements OnInit {

  public photoService = inject(PhotoService);
  public alertController = inject(AlertController);

  book = signal<BookPost>({
    name: '',
    description: '',
    author: '',
    location: '',
    genres: []
  });

  bookPhoto = signal<string | undefined>(undefined);

  genres: Genre[] = [];

  constructor(private bookService: BookService, private router: Router) { }

  async ngOnInit() {
    
    this.genres = await this.bookService.getGenres();

  }

  isHovering = false;

  async takePhoto() {

    const webPath = await this.photoService.takePhoto();
    this.bookPhoto.set(webPath);

  }

  async onSubmit() {
    try {

      const reply = await this.bookService.publishBook(this.book());
      console.log('Libro publicado correctamente');

      const alert = await this.alertController.create({
        header: 'Éxito',
        message: '¡El libro se publicó correctamente!',
        buttons: ['OK']
      });
      await alert.present();

      await this.bookService.submitPhoto(reply.bookId, this.bookPhoto() || '')

    } catch (err) {
      console.error('Error al publicar libro', err);
      console.log('Error al publicar libro');
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
