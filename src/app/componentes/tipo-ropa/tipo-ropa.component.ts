import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';



@Component({
  selector: 'app-tipo-ropa',
  templateUrl: './tipo-ropa.component.html',
  styleUrls: ['./tipo-ropa.component.css']
})
export class TipoRopaComponent {
  prendas: any[] = [];
  genero: string | null = '';
  tipo: string | null = '';
  busqueda: string = '';
  ordenSeleccionado: string = '';
  prendasCollection: AngularFirestoreCollection<any>;

  constructor(private firestore: AngularFirestore, private route: ActivatedRoute) {
    this.prendasCollection = this.firestore.collection<any>('ropa');
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.genero = params.get('genero');
      this.tipo = params.get('tipo');
      this.obtenerPrendasPorTipo();
    });
  }

  obtenerPrendasPorTipo() {
    this.prendasCollection.valueChanges().subscribe(prendas => {
      this.prendas = prendas.filter(prenda => {
        if (this.genero && this.tipo) {
          return prenda.genero === this.genero && prenda.tipo === this.tipo;
        } else if (this.tipo) {
          return prenda.tipo === this.tipo;
        } else {
          return true;
        }
      });
    });
  }

  ordenarPorPrecio(orden: 'asc' | 'desc') {
    this.prendas.sort((a, b) => {
      if (orden === 'asc') {
        return a.precio - b.precio;
      } else {
        return b.precio - a.precio;
      }
    });
  }

  ordenarPorAlfabeto(orden: 'asc' | 'desc') {
    this.prendas.sort((a, b) => {
      if (orden === 'asc') {
        return a.nombre.localeCompare(b.nombre);
      } else {
        return b.nombre.localeCompare(a.nombre);
      }
    });
  }

  filtrarPrendas() {
    if (this.busqueda) {
      const filtro = this.busqueda.toLowerCase();
      this.prendas = this.prendas.filter(prenda => {
        return (
          prenda.nombre.toLowerCase().includes(filtro) ||
          prenda.descripcion.toLowerCase().includes(filtro)
        );
      });
    } else {
      this.obtenerPrendasPorTipo();
    }
  }

  
}
