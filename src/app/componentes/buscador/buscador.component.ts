import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.component.html',
  styleUrls: ['./buscador.component.css']
})
export class BuscadorComponent {
  searchText: string = '';
  prendasEncontradas: any[] = [];
  generoSeleccionado: string = '';
  ordenSeleccionado: string = '';
  prendas: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private storage:AngularFireStorage
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.searchText = params['texto'];
      this.buscarPrendas(this.searchText);
    });
  }

  buscarPrendas(searchText: string): void {
    if (searchText) {
      const filtro = searchText.toLowerCase();
      this.firestore.collection('ropa').snapshotChanges().subscribe((snapshot) => {
        this.prendasEncontradas = snapshot.map((doc) => {
          const id = doc.payload.doc.id;
          const data: any = doc.payload.doc.data();
          return { id, ...data };
        }).filter(prenda =>
          prenda.Nombre.toLowerCase().indexOf(filtro) !== -1 ||
          prenda.Descripcion.toLowerCase().indexOf(filtro) !== -1
        );

        // Obtener la URL de la imagen para cada prenda
        this.prendasEncontradas.forEach(prenda => {
          const ref = this.storage.ref(`Ropa/${prenda.id}`);
          ref.listAll().toPromise().then(result => {
            if (result && result.items.length > 0) {
              result.items[0].getDownloadURL().then(url => {
                prenda.imagen = url;
              });
            }
          });
        });

        this.ordenarPrendas();
      });
    } else {
      this.prendasEncontradas = [];
    }
  }
  
  

  ordenarPorPrecio(orden: string): void {
    this.ordenSeleccionado = orden;
    this.ordenarPrendas();
  }

  ordenarPorAlfabeto(orden: string): void {
    this.ordenSeleccionado = orden;
    this.ordenarPrendas();
  }

  ordenarPrendas(): void {
    if (this.prendasEncontradas && this.prendasEncontradas.length > 0) {
      if (this.ordenSeleccionado === 'asc') {
        this.prendasEncontradas.sort((a, b) => a.Precio - b.Precio);
      } else if (this.ordenSeleccionado === 'desc') {
        this.prendasEncontradas.sort((a, b) => b.Precio - a.Precio);
      } else if (this.ordenSeleccionado === 'az') {
        this.prendasEncontradas.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
      } else if (this.ordenSeleccionado === 'za') {
        this.prendasEncontradas.sort((a, b) => b.Nombre.localeCompare(a.Nombre));
      }
    }
  }
}
