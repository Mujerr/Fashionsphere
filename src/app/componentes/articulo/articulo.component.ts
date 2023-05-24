import { Component, Input, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { RopaService } from 'src/app/servicios/ropa.service';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-articulo',
  templateUrl: './articulo.component.html',
  styleUrls: ['./articulo.component.css']
})
export class ArticuloComponent implements OnInit {
  imageUrls: string[] = [];
  isHovering = false;
  id: string | null = null;
  articulo: any; // Propiedad para almacenar los datos del artículo
  selectedColor: string | undefined; // Color seleccionado

  @Input() colores: string | undefined;

  constructor(private rs: RopaService, private storage: AngularFireStorage, private activeRouter: ActivatedRoute,private afAuth: AngularFireAuth,  private firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.id = this.activeRouter.snapshot.paramMap.get('id');

    if (this.id) {
      this.rs.getArticulo(this.id).subscribe((data) => {
        this.articulo = data;
      });
    }

    const ref = this.storage.ref(`Ropa/${this.id}`);
    ref.listAll().subscribe((result) => {
      const promises: Promise<string>[] = result.items.map((item) => item.getDownloadURL());
      Promise.all(promises).then((urls) => {
        this.imageUrls = urls;
        const storedColor = localStorage.getItem('selectedColor'); // Obtener el color almacenado en el localStorage
        this.selectedColor = storedColor || this.articulo.Colores[0]; // Asignar el color almacenado o el primer color por defecto
        this.updateSelectedColor(); // Actualizar la imagen seleccionada según el color almacenado
      });
    });
  }

  selectColor(color: string) {
    this.selectedColor = color;
    this.updateSelectedColor();
    localStorage.setItem('selectedColor', color); // Almacenar el color seleccionado en el localStorage
  }

  private updateSelectedColor() {
    const ref = this.storage.ref(`Ropa/${this.id}/${this.selectedColor}.jpg`);
    ref.getDownloadURL().subscribe((url) => {
      this.imageUrls = [url]; // Actualizar la lista de URLs de imágenes
    });
  }

  async addToFavorites() {
    const user = await this.afAuth.currentUser;
    const userId = user?.uid;
    
    if (user) {
      const favoritosRef = this.firestore.collection('favoritosGuardados');
      
      favoritosRef.add({
        userId: userId,
        articuloId: this.id,
        color: this.selectedColor
      })
      .then(() => {
        console.log('Artículo agregado a favoritos correctamente');
      })
      .catch((error) => {
        console.log('Error al agregar artículo a favoritos:', error);
      });
    } else {
      console.log('No se ha encontrado el usuario autenticado');
    }
  }
}