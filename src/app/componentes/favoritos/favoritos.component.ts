import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
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
    private storage:AngularFireStorage
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
      console.log(prenda.imageUrl);
    });
  }
}