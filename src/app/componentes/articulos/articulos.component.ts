import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AlertasService } from 'src/app/servicios/alertas.service';
import { RopaService } from 'src/app/servicios/ropa.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';

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
selectedColor: string | null = ''; // Color seleccionado
isFavorito = false;

@Input() articulos:any ={}
@Input() idRopa:string = "";
@Input() colores:string | undefined;

constructor(private rs:RopaService,
            private storage: AngularFireStorage,
            private afAuth: AngularFireAuth,  
            private firestore: AngularFirestore,
            private cdr: ChangeDetectorRef,
            private usuario:UsuarioService,
            private alerta:AlertasService){}

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
  
  addToFavorites(id:string): void {
    const selectedColor = this.selectedColor;
  
    if (id && selectedColor !== null) {
      this.usuario.addToFavorites(id, selectedColor);
      this.reloadPage();
    } else {
      this.alerta.errorAgregarFavorito()
    }
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
                this.isFavorito = false;
                this.initialFavoriteState = false;
              }).catch(error => { this.alerta.errorAgregarFavorito(); });
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
