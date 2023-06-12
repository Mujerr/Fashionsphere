import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AlertasService } from 'src/app/servicios/alertas.service';
import { RopaService } from 'src/app/servicios/ropa.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css']
})
export class FavoritosComponent implements OnInit {
  prendasFavoritas: any[] = [];
  imageUrls: string = '';

  constructor(
    private afAuth: AngularFireAuth,
    private favoritosService: RopaService,
    private storage:AngularFireStorage,
    private firestore: AngularFirestore,
    private alerta:AlertasService

  ) { }

  ngOnInit(): void {
    // Obtener el usuario autenticado
    this.afAuth.authState.subscribe(user => {
      if (user) {
        const userId = user.uid;
        console.log(userId);
        this.favoritosService.getPrendasFavoritasByUserId(userId).subscribe((prendas: any[]) => {
          this.prendasFavoritas = prendas;
          this.prendasFavoritas.forEach(prenda => {
            this.selectColor(prenda.prendaId, prenda.color, prenda);
          });
        });
      }
    });
  }
  selectColor(prendaId: string, color: string, prenda: any) {
    const imagePath = `Ropa/${prendaId}/${color}.jpg`;
    const ref = this.storage.ref(imagePath);
  
    ref.getDownloadURL().subscribe(url => {
      prenda.imageUrl = url; // Asignar la URL directamente a la prenda correspondiente
    });
  }

  async BorrarColorFavorito(id: string, color: string): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const userId = user.uid;
      const favoritosRef = this.firestore.collection('favoritosGuardado').doc(userId);
  
      if (id) {
        favoritosRef.get().subscribe(snapshot => {
          const data: any = snapshot.data();
          if (data && typeof data === 'object') {
            const colors = data[id]?.colors || [];
  
            if (colors.includes(color)) {
              // Si el color ya está en favoritos, eliminarlo
              const updatedColors = colors.filter((c: string) => c !== color);
              const newData = {
                ...data,
                [id]: {
                  colors: updatedColors
                }
              };
              favoritosRef.set(newData).then(() => {}).catch(error => { this.alerta.errorAgregarFavorito()});
            } else { this.alerta.errorAgregarFavorito() }
          } else {
            console.log('No hay datos de favoritos');
          }
        });
      } else {
        this.alerta.errorAgregarFavorito()      }
    } else {
      this.alerta.noAutenticado()
    }
  }
}