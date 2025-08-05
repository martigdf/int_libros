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
import { PlaceService } from 'src/app/services/place.service';

@Component({
  selector: 'app-publish-book',
  templateUrl: './publish-book.page.html',
  styleUrls: ['./publish-book.page.scss'],
  standalone: true,
  imports: [ IonicModule, CommonModule, FormsModule ]
})
export class PublishBookPage implements OnInit {

  public placeService = inject(PlaceService);
  public photoService = inject(PhotoService);
  public alertController = inject(AlertController);

  book = signal<BookPost>({
    name: '',
    description: '',
    author: '',
    location: '',
    genres: []
  });

  departamento = '';
  localidad = '';

  bookPhoto = signal<string | undefined>(undefined);

  departamentos: string[] = [
    'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno',
    'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Montevideo',
    'Paysandú', 'Río Negro', 'Rivera', 'Rocha', 'Salto',
    'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
  ];
  
  localidades: string[] = [];

  genres: Genre[] = [];

  constructor(private bookService: BookService, private router: Router) { }

  async ngOnInit() {
    
    this.genres = await this.bookService.getGenres();

  }

  async onDepartamentoChange() {
    this.localidad = '';
    this.localidades = [];

    if (this.departamento) {
      
      this.localidades = await this.placeService.getPlacesFromDepartment(this.departamento);

    }
  }


  isHovering = false;

  async takePhoto() {

    const webPath = await this.photoService.takePhoto();
    this.bookPhoto.set(webPath);

  }

  async onSubmit() {

    try {

      this.book().location = this.localidad + ", " + this.departamento;

      console.log(this.book().location)

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
