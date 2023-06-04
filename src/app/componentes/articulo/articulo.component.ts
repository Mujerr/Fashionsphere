import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
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
  selectedColor: string = ''; // Color seleccionado
  isFavorito = false;
  prenda: any; // Variable que contiene los datos de la prenda seleccionada
  tallaSeleccionada: string = ''; // Variable para almacenar la talla seleccionada
  mostrarUnidades: boolean = false; // Variable para controlar la visualización de las unidades restantes
  @Input() colores: string | undefined;
  initialFavoriteState = false;
  isAddToCartDisabled = false; // Estado del botón "Add to Cart"


  constructor(private rs: RopaService, 
              private storage: AngularFireStorage, 
              private activeRouter: ActivatedRoute,
              private afAuth: AngularFireAuth,  
              private firestore: AngularFirestore,
              private cdr: ChangeDetectorRef
    ){} 

    ngOnInit(): void {
      this.id = this.activeRouter.snapshot.paramMap.get('id');
    
      if (this.id) {
        this.rs.getArticulo(this.id).subscribe((data) => {
          this.articulo = data;
          this.loadArticuloData();
        });
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

  selectColor(color: string) {
    this.selectedColor = color;
    this.updateSelectedColor();
    localStorage.setItem('selectedColor', color); // Almacenar el color seleccionado en el localStorage
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



  async addToFavorites(): Promise<void> {
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
//Añadir a la cesta
async addToCard(precio: number): Promise<void> {
  const user = await this.afAuth.currentUser;
  if (user) {
    const userId = user.uid;
    const carritoRef = this.firestore.collection('Carrito').doc(userId);

    if (this.id) {
      const idValue = this.id;
      carritoRef.get().subscribe((snapshot) => {
        const data: any = snapshot.data();
        if (data && typeof data === 'object') {
          const item = data[idValue];
          let updatedItem: any;

          if (item) {
            // El artículo ya existe en el carrito
            const cartItems = item.cartItems || [];

            const updatedCartItems = [...cartItems];
            const existingItemIndex = updatedCartItems.findIndex( 
              (cartItem: any) => cartItem.id === idValue && cartItem.color === this.selectedColor && cartItem.talla === this.tallaSeleccionada);

            if (existingItemIndex !== -1) {
              // Si el artículo con el mismo color y talla ya existe en el carrito, actualizar la cantidad
              const existingItem = updatedCartItems[existingItemIndex];
              existingItem.cantidad += 1;
            } else {
              // Si el artículo con el mismo color y talla no existe en el carrito, agregarlo
              const newItem = {
                id: idValue,
                color: this.selectedColor,
                talla: this.tallaSeleccionada,
                cantidad: 1,
              };
              updatedCartItems.push(newItem);
            }

            updatedItem = {
              ...item,
              cartItems: updatedCartItems,
              total: item.total + precio,
            };
          } else {
            // El artículo no existe en el carrito, agregarlo con el color, talla y cantidad inicial
            const newItem = {
              id: idValue,
              color: this.selectedColor,
              talla: this.tallaSeleccionada,
              cantidad: 1,
            };

            updatedItem = {
              cartItems: [newItem],
              total: precio,
            };
          }

          const newData = {
            ...data,
            [idValue]: updatedItem,
          };

          carritoRef
            .set(newData)
            .then(() => {
              console.log('Artículo agregado al carrito correctamente');
            })
            .catch((error) => {
              console.log('Error al agregar artículo al carrito:', error);
            });
        } else {
          // No hay datos en el carrito, agregar el artículo con el color, talla y cantidad inicial
          const newItem = {
            id: idValue,
            color: this.selectedColor,
            talla: this.tallaSeleccionada,
            cantidad: 1,
          };

          const newData = {
            [idValue]: {
              cartItems: [newItem],
              total: precio,
            },
          };

          carritoRef
            .set(newData)
            .then(() => {
              console.log('Artículo agregado al carrito correctamente');
              this.isFavorito = true;
            })
            .catch((error) => {
              console.log('Error al agregar artículo al carrito:', error);
            });
        }
      });
    } else {
      console.log('ID de artículo no válido');
    }
  } else {
    console.log('No se ha encontrado el usuario autenticado');
  }
}

  private reloadPage(): void {
    this.ngOnInit();
    this.cdr.detectChanges();
  }
  
  
}