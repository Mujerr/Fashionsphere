import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-tipo-ropa',
  templateUrl: './tipo-ropa.component.html',
  styleUrls: ['./tipo-ropa.component.css']
})
export class TipoRopaComponent implements OnInit {
  imageUrls: string[] = [];
  prendas: any[] = [];
  genero: string | null = '';
  tipo: string | null = '';
  busqueda: string = '';
  ordenSeleccionado: string = '';
  prendasCollection: AngularFirestoreCollection<any>;
  id:string = '';
  
  constructor(private firestore: AngularFirestore, 
              private route: ActivatedRoute,
              private storage: AngularFireStorage ) {
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
    this.prendasCollection.snapshotChanges().subscribe((snapshot) => {
      this.prendas = snapshot.map((doc) => {
        const id = doc.payload.doc.id;
        const data: any = doc.payload.doc.data();
        return { id, ...data };
      }).filter(prenda => {
        if (this.genero && this.tipo) {
          return prenda.Genero === this.genero && prenda.Tipo === this.tipo;
        } else if (this.tipo) {
          return prenda.Tipo === this.tipo;
        } else if (this.genero) {
          return prenda.Genero === this.genero;
        } else {
          return true;
        }
      });
  
      const prendasIds: string[] = this.prendas.map(prenda => prenda.id);
      this.imageUrls = []; // Limpiar las URLs de las imágenes previas
      this.obtenerImagenesPrendas(prendasIds); // Llamar a la función para obtener las nuevas imágenes de las prendas
    });
  }
  
  
  

  obtenerImagenesPrendas(prendasIds: string[]) {
    this.imageUrls = []; // Limpiar las URLs de las imágenes previas
  
    const imagenPorId: { [id: string]: string } = {};
  
    const promises: Promise<void>[] = prendasIds.map((prendaId) => {
      const ref = this.storage.ref(`Ropa/${prendaId}`);
      return ref.listAll().toPromise().then((result) => {
        if (result && result.items.length > 0) {
          return result.items[0].getDownloadURL().then((url) => {
            imagenPorId[prendaId] = url;
          });
        } else {
          return Promise.resolve(); // Devolver una promesa vacía en caso de que result sea undefined
        }
      });
    });
  
    Promise.all(promises).then(() => {
      // Asignar las imágenes a cada prenda
      this.prendas.forEach((prenda) => {
        prenda.imagen = imagenPorId[prenda.id];
      });
    });
  }
  
  
  

  

  ordenarPorPrecio(orden: 'asc' | 'desc') {
    this.prendas.sort((a, b) => {
      const precioA = a.Precio;
      const precioB = b.Precio;
      if (orden === 'asc') {
        return precioA - precioB;
      } else {
        return precioB - precioA;
      }
    });
  }
  
  ordenarPorAlfabeto(orden: 'asc' | 'desc') {
    this.prendas.sort((a, b) => {
      const nombreA = a.Nombre ? a.Nombre.toLowerCase() : '';
      const nombreB = b.Nombre ? b.Nombre.toLowerCase() : '';
      if (orden === 'asc') {
        return nombreA.localeCompare(nombreB);
      } else {
        return nombreB.localeCompare(nombreA);
      }
    });
  }

  
  filtrarPrendas() {
    if (this.busqueda) {
      const filtro = this.busqueda.toLowerCase();
      this.prendas = this.prendas.filter(prenda => {
        if (prenda && prenda.Nombre && prenda.Descripcion) {
          return (
            prenda.Nombre.toLowerCase().includes(filtro) ||
            prenda.Descripcion.toLowerCase().includes(filtro)
          );
        }
        return false; // O devuelve true si deseas mantener la prenda en caso de propiedades faltantes
      });
    } else {
      this.obtenerPrendasPorTipo();
    }
  }
  

  
}
