import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { RopaService } from 'src/app/servicios/ropa.service';

@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.css']
})
export class ArticulosComponent implements OnInit {

imageUrls: string[] = [];
isHovering = false;
initialFavoriteState = false;
articulo: any; // Propiedad para almacenar los datos del artículo
selectedColor: string | undefined; // Color seleccionado
isFavorito = false;

@Input() articulos:any ={}
@Input() idRopa:string = "";
@Input() colores:string | undefined;

constructor(private rs:RopaService,
            private storage: AngularFireStorage,
            private afAuth: AngularFireAuth,  
            private firestore: AngularFirestore,
            private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    const ref = this.storage.ref(`Ropa/${this.idRopa}`);
    ref.listAll().subscribe((result) => {
      // Transformar la lista de objetos Reference en un arreglo de Promesas de URLs
      const promises: Promise<string>[] = result.items.map((item) => item.getDownloadURL());
      // Esperar a que se completen todas las Promesas
      Promise.all(promises).then((urls) => {
        // Asignar el arreglo de URLs a la propiedad imageUrls
        this.imageUrls = urls;
      });
    });
  }

  selectColor(color:string){
      const ref = this.storage.ref(`Ropa/${this.idRopa}/${color}.jpg`);
      ref.getDownloadURL().subscribe(url => {
        this.imageUrls = url;
      });
      this.selectedColor = color;
      this.checkFavorite(this.idRopa);
  }
  
  async addToFavorites(id:string): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const userId = user.uid;
      const favoritosRef = this.firestore.collection('favoritosGuardado').doc(userId);
  
      if (id) {
        const idValue = id;
        favoritosRef.get().subscribe(snapshot => {
          const data: any = snapshot.data();
          if (data && typeof data === 'object') {
            const colors = data[idValue]?.colors || [];
  
            if (colors.includes(this.selectedColor)) {
              // Si el color ya está en favoritos, eliminarlo
              const updatedColors = colors.filter((color: string) => color !== this.selectedColor);
              const newData = {
                ...data,
                [idValue]: {
                  colors: updatedColors
                }
              };
              favoritosRef.set(newData).then(() => {
                console.log('Color eliminado de favoritos correctamente');
                this.isFavorito = false;
              }).catch(error => {
                console.log('Error al eliminar color de favoritos:', error);
              });
            } else {
              // Si el color no está en favoritos, agregarlo
              const newData = {
                ...data,
                [idValue]: {
                  colors: [...colors, this.selectedColor]
                }
              };
              favoritosRef.set(newData).then(() => {
                console.log('Color agregado a favoritos correctamente');
                this.isFavorito = true;
              }).catch(error => {
                console.log('Error al agregar color a favoritos:', error);
              });
            }
          } else {
            // No hay datos de favoritos, agregar el color
            const newData = {
              [idValue]: {
                colors: [this.selectedColor]
              }
            };
            favoritosRef.set(newData).then(() => {
              console.log('Color agregado a favoritos correctamente');
              this.isFavorito = true;
            }).catch(error => {
              console.log('Error al agregar color a favoritos:', error);
            });
          }
        });
      } else {
        console.log('ID de artículo no válido');
      }
    } else {
      console.log('No se ha encontrado el usuario autenticado');
    }
    this.reloadPage();
  }

  async checkFavorite(id:string): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const userId = user.uid;
      const favoritosRef = this.firestore.collection('favoritosGuardado').doc(userId);
  
      if (id) {
        const idValue = id;
        favoritosRef.get().subscribe(snapshot => {
          const data: any = snapshot.data();
          if (data && typeof data === 'object') {
            const colors = data[idValue]?.colors || [];
  
            if (colors.length === 0) {
              // Eliminar el ID del documento de favoritos si no hay colores
              delete data[idValue];
              favoritosRef.set(data).then(() => {
                console.log('ID eliminado de favoritos correctamente');
                this.isFavorito = false;
                this.initialFavoriteState = false;
              }).catch(error => {
                console.log('Error al eliminar ID de favoritos:', error);
              });
            } else {
              this.isFavorito = colors.includes(this.selectedColor);
              this.initialFavoriteState = this.isFavorito;
            }
          } else {
            this.isFavorito = false;
            this.initialFavoriteState = false;
          }
        });
      }
    }
  } 


  private reloadPage(): void {
    this.ngOnInit();
    this.cdr.detectChanges();
  }
  

}
