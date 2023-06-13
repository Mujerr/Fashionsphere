import { ChangeDetectorRef, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { AlertasService } from './alertas.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators'
import { AngularFireStorage } from '@angular/fire/compat/storage';
import * as firebase from 'firebase/compat';
import { getAuth, deleteUser as deleteFirebaseUser } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private afAuth: AngularFireAuth,
              private cdr: ChangeDetectorRef,
              private alerta: AlertasService,
              private firestore: AngularFirestore,
              private storage: AngularFireStorage ) {}

  sacarUsuarioConectado(): Observable<firebase.default.User | null> {
    return this.afAuth.user;
  }

  async getCurrentUser(): Promise<firebase.default.User | null> {
    const user = await this.afAuth.currentUser;
    return user;
  }

  reloadPage(): void {
    this.cdr.detectChanges();
  }



  async addToFavorites(id: string, selectedColor: string): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const userId = user.uid;
      const favoritosRef = this.firestore.collection('favoritosGuardado').doc(userId);

      favoritosRef.get().subscribe(snapshot => {
        const data: any = snapshot.data();
        if (data && typeof data === 'object') {
          const colors = data[id]?.colors || [];

          if (colors.includes(selectedColor)) {
            // Si el color ya está en favoritos, eliminarlo
            const updatedColors = colors.filter((color: string) => color !== selectedColor);
            const newData = {
              ...data,
              [id]: {
                colors: updatedColors
              }
            };
            favoritosRef.set(newData).then(() => { }).catch(error => {
              this.alerta.errorAgregarFavorito()
            });
          } else {
            // Si el color no está en favoritos, agregarlo
            const newData = {
              ...data,
              [id]: {
                colors: [...colors, selectedColor]
              }
            };
            favoritosRef.set(newData).then(() => { }).catch(error => { this.alerta.errorAgregarFavorito() });
          }
        } else {
          // No hay datos de favoritos, agregar el color
          const newData = {
            [id]: {
              colors: [selectedColor]
            }
          };
          favoritosRef.set(newData).then(() => { }).catch(error => {this.alerta.errorAgregarFavorito();});
        }
      });
    } else {
      this.alerta.noAutenticado(); 
    }
  }


  async addToCard(id: string, selectedColor: string, tallaSeleccionada: string, precio: number): Promise<void> {
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
                existingItem.cantidad += 1;
              } else {
                // Si el artículo con el mismo color y talla no existe en el carrito, agregarlo
                const newItem = {
                  id: idValue,
                  color: selectedColor,
                  talla: tallaSeleccionada,
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
                color: selectedColor,
                talla: tallaSeleccionada,
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
              .then(() => { this.alerta.agregarCarrito() })
              .catch((error) => {this.alerta.errorAgregarCarrito()  });
          } else {
            // No hay datos en el carrito, agregar el artículo con el color, talla y cantidad inicial
            const newItem = {
              id: idValue,
              color: selectedColor,
              talla: tallaSeleccionada,
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
              .then(() => { this.alerta.agregarCarrito() })
              .catch((error) => {this.alerta.errorAgregarCarrito()  });
          }
        });
      } else {
        this.alerta.errorAgregarCarrito()
      }
    } else { this.alerta.noAutenticado() }
  }




  getUser(): Observable<any> {
    return this.afAuth.user;
  }

  // Verificar si el usuario actual es administrador
  esUsuarioAdmin(): Observable<boolean> {
    return this.getUser().pipe(
      map(user => {
        // Aquí debes ajustar el email de administrador según el valor real
        const emailAdmin = 'admin@fashionsphere.store';
        
        // Verificar si el usuario tiene el email de administrador
        return user && user.email === emailAdmin;
      })
    );
  }

  async borrarUsuario(userId: string) {
    try {
      const carpeta = `users/${userId}`;
      const storageRef = this.storage.ref(carpeta);
      const result = await storageRef.listAll().toPromise();
      await this.firestore.collection('users').doc(userId).delete();

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        await deleteFirebaseUser(currentUser);

        if (result && result.items.length > 0) {
          await Promise.all(result.items.map(itemRef => itemRef.delete()));
        }

        console.log('Usuario borrado exitosamente');
      } else {
        console.log('No se encontró un usuario actual');
      }
    } catch (error) {
      console.error('Error al borrar el usuario:', error);
      this.alerta.noUsuario(); 
    }
  }
  
  

}
