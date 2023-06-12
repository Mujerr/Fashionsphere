import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { RopaService } from 'src/app/servicios/ropa.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AlertasService } from 'src/app/servicios/alertas.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {

  constructor(
    private afAuth: AngularFireAuth,
    private Service: RopaService,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private router: Router,
    private alerta: AlertasService
  ) {}

  Carrito: any[] = [];
  imageUrls: string = '';
  totalFinal:number | undefined;
  precio:number =0;
  
  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        const userId = user.uid;
        this.actualizarTotalFinal(user.uid)
        this.Service.getCarritoByUserId(userId).subscribe((prendas: any[]) => {
          this.Carrito = prendas;
          this.Carrito.forEach(prenda => {
            this.cargarColor(prenda.prendaId, prenda.color, prenda);
            this.getPrecioPrendaById(prenda.id).subscribe((precio) => {
              this.precio = precio;
            });
          });
        });
      }
    });
  }

  cargarColor(prendaId: string, color: string, prenda: any) {
    const imagePath = `Ropa/${prendaId}/${color}.jpg`;
    const ref = this.storage.ref(imagePath);
  
    ref.getDownloadURL().subscribe(url => {
      prenda.imageUrls = url; // Asignar la URL directamente a la prenda correspondiente
    });
  }

  async actualizarCesta(precio: number, id: string, selectedColor: string, tallaSeleccionada: string, cantidad: number): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const userId = user.uid;
      const carritoRef = this.firestore.collection('Carrito').doc(userId);
  
      if (id) {
        const idValue = id;
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
                (cartItem: any) =>
                  cartItem.id === idValue &&
                  cartItem.color === selectedColor &&
                  cartItem.talla === tallaSeleccionada
              );
  
              if (existingItemIndex !== -1) {
                // Si el artículo con el mismo color y talla ya existe en el carrito, actualizar la cantidad
                const existingItem = updatedCartItems[existingItemIndex];
                existingItem.cantidad = cantidad; // Actualizar la cantidad con el valor proporcionado
  
                updatedItem = {
                  ...item,
                  cartItems: updatedCartItems,
                  total: precio * cantidad, // Calcular el nuevo total multiplicando el precio por la cantidad
                };
              } else {
                return; // Salir de la función si el artículo no existe en el carrito
              }
            } else {
              return; // Salir de la función si el artículo no existe en el carrito
            }
  
            const newData = {
              ...data,
              [idValue]: updatedItem,
            };
  
            carritoRef
              .set(newData)
              .then(() => {this.actualizarTotalFinal(userId) })
          }
        });
      }
    } else {  this.alerta.noAutenticado() }
  }

  async eliminarArticulo(idPrenda: string, color: string, talla: string, cantidad: number): Promise<void> {
    const user = await this.afAuth.currentUser;
  
    if (user) {
      const userId = user.uid;
      const carritoRef = this.firestore.collection('Carrito').doc(userId);
  
      carritoRef.get().subscribe((snapshot) => {
        const data: any = snapshot.data();
  
        if (data && typeof data === 'object') {
          const item = data[idPrenda];
  
          if (item) {
            const updatedCartItems = item.cartItems.filter(
              (cartItem: any) => !(cartItem.id === idPrenda && cartItem.color === color && cartItem.talla === talla)
            );
  
            this.getPrecioPrendaById(idPrenda).subscribe((precio) => {
              const totalPrice = item.total - precio * cantidad;
  
              const updatedItem = {
                ...item,
                cartItems: updatedCartItems,
                total: totalPrice
              };
  
              const newData = {
                ...data,
                [idPrenda]: updatedItem,
              };
  
              carritoRef
                .set(newData)
                .then(() => { this.actualizarTotalFinal(userId); })
                .catch((error) => { this.alerta.agregarCarrito});
            });
          }
        }
      });
    } else { this.alerta.noAutenticado() }
  }

  private actualizarTotalFinal(userId: string): void {
    const carritoRef = this.firestore.collection('Carrito').doc(userId);
    carritoRef.get().toPromise().then((snapshot) => {
      const data: any = snapshot?.data();
      if (data && typeof data === 'object') {
        const totales = Object.values(data).map((item: any) => item.total);
        const totalFinal = totales.reduce((sum: number, total: number) => sum + total, 0);
        // Actualizar la variable o propiedad totalFinal con el valor calculado
        this.totalFinal = totalFinal;
      } else {
        // No hay datos en el carrito
        this.totalFinal = 0;
      }
    }).catch((error) => {
      console.log('Error al obtener el total final del carrito:', error);
      this.totalFinal = 0;
    });
  }
  
  getPrecioPrendaById(prendaId: string): Observable<number> {
    const precioPath = `ropa/${prendaId}`;
    return this.firestore.doc<any>(precioPath).valueChanges().pipe(
      map(prenda => prenda?.Precio || 0) 
    );

  }

  comprar(){
    this.router.navigate(['/comprar'] ,{ queryParams: { total: this.totalFinal } });
  }
}