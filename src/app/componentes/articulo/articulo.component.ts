import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { RopaService } from 'src/app/servicios/ropa.service';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';
import { AlertasService } from 'src/app/servicios/alertas.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-articulo',
  templateUrl: './articulo.component.html',
  styleUrls: ['./articulo.component.css']
})
export class ArticuloComponent implements OnInit {
  imageUrls: string[] = [];
  id: string  = '';
  articulo: any; // Propiedad para almacenar los datos del artículo
  selectedColor: string | null = ''; // Color seleccionado
  isFavorito = false;
  prenda: any; // Variable que contiene los datos de la prenda seleccionada
  tallaSeleccionada: string = ''; // Variable para almacenar la talla seleccionada
  mostrarUnidades: boolean = false; // Variable para controlar la visualización de las unidades restantes
  @Input() colores: string | undefined;
  initialFavoriteState = false;
  isAddToCartDisabled = false; // Estado del botón "Add to Cart"

  selectedId: string | null = '';

  constructor(private rs: RopaService, 
              private storage: AngularFireStorage, 
              private activeRouter: ActivatedRoute,
              private afAuth: AngularFireAuth,  
              private firestore: AngularFirestore,
              private cdr: ChangeDetectorRef,
              private alerta: AlertasService,
              private usuario: UsuarioService 
    ){} 

    ngOnInit(): void {
      this.id = this.activeRouter.snapshot.paramMap.get('id') ?? '';
      this.selectedId = localStorage.getItem('selectedId');
      this.selectedColor = localStorage.getItem('selectedColor');
      if (this.id) {
        this.rs.getArticulo(this.id).subscribe((data) => {
          this.articulo = data;
          this.loadArticuloData();
        });
      }
      const storedId = localStorage.getItem('selectedId');
      if (storedId !== this.id) {
        localStorage.removeItem('selectedColor');
        localStorage.removeItem('selectedId');
      }
    }

    private async loadArticuloData(): Promise<void> {
      const ref = this.storage.ref(`Ropa/${this.id}`);
      const result = await ref.listAll().toPromise();
      const items = result?.items;
  
      if (items) {
        const promises: Promise<string>[] = items.map((item) => item.getDownloadURL());
        const urls = await Promise.all(promises);
  
        this.imageUrls = urls;
        const storedColor = localStorage.getItem('selectedColor');
        this.selectedColor = storedColor || this.articulo.Colores[0];
        this.updateSelectedColor();
  
        this.checkFavorite();
      }
    }

    selectColor(color: string, id: string) {
      this.selectedColor = color;
      this.updateSelectedColor();

      localStorage.setItem('selectedColor', color); // Almacenar el color seleccionado en el localStorage
      localStorage.setItem('selectedId', id); // Almacenar el ID actual en el localStorage
  
      this.reloadPage(); // Llamar al método reloadPage para recargar la página
    }

  private updateSelectedColor() {
    const ref = this.storage.ref(`Ropa/${this.id}/${this.selectedColor}.jpg`);
    ref.getDownloadURL().subscribe((url) => {
      this.imageUrls = [url]; // Actualizar la lista de URLs de imágenes
    });
  }

  selectTalla(talla: string) {
    this.tallaSeleccionada = talla;
    this.mostrarUnidades = true;
    this.checkAddToCartState();
  }

  getTallasKeys(tallas: any) {
    return Object.keys(tallas);
  }

  isTallaSeleccionada() {
    return this.tallaSeleccionada !== '';
  }

  hayUnidadesDisponibles() {
    return this.isTallaSeleccionada() && this.articulo.Tallas[this.tallaSeleccionada] > 0;
  }

  checkAddToCartState() {
    this.isAddToCartDisabled = !this.isTallaSeleccionada() || !this.hayUnidadesDisponibles();
  }



  addToFavorites(): void {
    const selectedColor = this.selectedColor;
  
    if (this.id && selectedColor !== null) {
      this.usuario.addToFavorites(this.id, selectedColor);
      this.reloadPage();
    } else {
      this.alerta.errorAgregarFavorito()
    }
  }
  

  async checkFavorite(): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const userId = user.uid;
      const favoritosRef = this.firestore.collection('favoritosGuardado').doc(userId);
  
      if (this.id) {
        const idValue = this.id;
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
              }).catch(error => {
                  this.alerta.errorAgregarFavorito();
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


//Añadir a la cesta
  async addToCard(precio: number): Promise<void> {
    const id = this.activeRouter.snapshot.paramMap.get('id');
    const selectedColor = this.selectedColor;
    const tallaSeleccionada = this.tallaSeleccionada;

    if (id && selectedColor !== null && tallaSeleccionada !== null) {
      await this.usuario.addToCard(id, selectedColor, tallaSeleccionada, precio);
    } else {
      this.alerta.errorAgregarCarrito();
    }
  }

  private reloadPage(): void {
    this.ngOnInit();
    this.cdr.detectChanges();
  }
  

  
}