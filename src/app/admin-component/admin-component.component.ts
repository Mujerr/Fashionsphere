import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UsuarioService } from '../servicios/usuario.service';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AlertasService } from '../servicios/alertas.service';
@Component({
  selector: 'app-admin-component',
  templateUrl: './admin-component.component.html',
  styleUrls: ['./admin-component.component.css']
})
export class AdminComponentComponent {
  users: any[] = []; 
  prendas: any[] = []; 
  pedidos: any[] = []; 

  tallas: string[] = []; // Lista de tallas
  colores: string[] = [];
  imagenes: File[] = [];

  id:string = ''
  public nuevoColor: string = '';
  tallaNueva: string = ''; // Talla nueva a agregar
  tallasDisponibles: string[] = ['XS', 'S', 'M', 'L', 'XL','UNIC'];
  tallasUnidades: { talla: string, unidades: number }[] = [];

  nuevaPrenda: any = {}; // Objeto para almacenar la nueva prenda

  isAdmin: boolean = false;
  mostrarFormulario: boolean = false; // Variable para controlar la visualización del formulario
  formularioValido: boolean = true;
  noApto:boolean = false;
  formatoValido = true;
  tipoDato: boolean = false;

  nuevoProducto: {
    nombre: string;
    descripcion: string;
    talla: string;
    unidades: number | null;
    genero: string;
    tipo: string;
    precio: number;
    colores: never[];
    imagenes: File[];
  } = {
    nombre: '',
    descripcion: '',
    talla: '',
    unidades: null,
    genero: '',
    tipo: '',
    precio: 0,
    colores: [],
    imagenes: []
  };
  prendaSeleccionada:any =  {};

  constructor(private firestore: AngularFirestore,
              private usuario:UsuarioService,
              private router:Router,
              private storage: AngularFireStorage,
              private alerta:AlertasService,
              ) {}

  ngOnInit() {
    this.usuario.esUsuarioAdmin().subscribe(isAdmin => { if (!isAdmin) { this.router.navigate(['/home']); } else {  this.isAdmin = true; } })
    
      this.firestore.collection('users').snapshotChanges().subscribe((snapshot) => {
        this.users = snapshot.map((doc) => {
          const id = doc.payload.doc.id;
          const data: any = doc.payload.doc.data();
          return { id, ...data };
        });
        console.log(this.users);
      });

      this.firestore.collection('ropa').snapshotChanges().subscribe((snapshot) => {
        this.prendas = snapshot.map((doc) => {
          const id = doc.payload.doc.id;
          const data: any = doc.payload.doc.data();
          return { id, ...data };
        });
      });
    
      this.firestore.collection('pedidos').valueChanges().subscribe((pedidos: any[]) => {
        this.pedidos = pedidos;
      });
    }

    actualizarTallasDisponibles(): void {
      const seleccionada = this.nuevoProducto.talla;
      this.tallasDisponibles = this.tallasDisponibles.filter(talla => talla !== seleccionada);
    }

    agregarTallaUnidades(): void {
      const talla = this.nuevoProducto.talla;
      let unidades = this.nuevoProducto.unidades;
      if (unidades === null) {
        unidades = 0; // Asigna un valor por defecto si unidades es null
      }
      this.tallasUnidades.push({ talla, unidades });
    
      // Eliminar la talla seleccionada de tallasDisponibles
      this.tallasDisponibles = this.tallasDisponibles.filter(t => t !== talla);
    
      this.nuevoProducto.talla = '';
      this.nuevoProducto.unidades = null;
    }
    
    eliminarTallaUnidades(index: number): void {
      const talla = this.tallasUnidades[index].talla;
      this.tallasDisponibles.push(talla);
      this.tallasUnidades.splice(index, 1);
    }
    

    agregarColor() {
      if (this.nuevoColor.trim() !== '') {
        const colorRegex = /^#([0-9A-Fa-f]{6})$/;
        if (colorRegex.test(this.nuevoColor)) {
          this.colores.push(this.nuevoColor);
          this.nuevoColor = '';
          this.noApto = false
        } else {
         this.noApto = true 
        }
      }
    }
    
    public eliminarColor(index: number): void {
      this.colores.splice(index, 1);
    }




    validarImagen(event: any): void {
      const files: FileList = event.target.files;
      const imagen: File = files[0];
      const nombre: string = imagen.name;
      const formatoValido: boolean = /^#[0-9a-fA-F]{6}\.jpg$/.test(nombre);
      
      if (formatoValido) {
        this.formatoValido = true;
        this.imagenes.push(imagen); // Agregar el archivo al array 'imagenes'
      } else {
        this.formatoValido = false;
        this.imagenes = []; // Limpiar el array 'imagenes'
      }
    }
    
    
    public eliminarImagen(index: number): void {
      this.imagenes.splice(index, 1);
    }



     borrarUsuario(userId: string) {
      this.usuario.borrarUsuario(userId);
    }
    
    
    
  
    modificarEstadoPedido(pedidoId: number) {
      // Lógica para modificar el estado del pedido con el ID especificado
    }


    mostrarFormularioPrenda() {
      this.mostrarFormulario = true;
      this.nuevaPrenda = {}; // Limpiar el objeto de nueva prenda
      this.tallas = []; // Limpiar la lista de tallas
      this.tallaNueva = ''; // Limpiar la talla nueva
    }
  
    agregarTalla(talla: string) {
      if (talla) {
        this.tallas.push(talla);
        this.tallaNueva = ''; // Limpiar la talla nueva después de agregarla
      }
    }
  
    eliminarTalla(index: number) {
      this.tallas.splice(index, 1);
    }

    guardar() {
        if(this.tipoDato){ this.actualizarPrenda(); }else{ this.guardarPrenda(); }
    }
    
    async guardarPrenda() {
      // Guardar los colores en un array
      const coloresArray = this.colores.map(color => color.toLowerCase());
    
      // Crear un documento nuevo en la colección "ropa"
      const docRef = await this.firestore.collection('ropa').add({
        Nombre: this.nuevoProducto.nombre,
        Genero: this.nuevoProducto.genero,
        Descripcion: this.nuevoProducto.descripcion,
        Tipo: this.nuevoProducto.tipo,
        Precio: this.nuevoProducto.precio,
        Tallas: this.tallasUnidades.reduce((map: { [talla: string]: number }, tallaUnidad) => {
          if (tallaUnidad.talla && tallaUnidad.unidades) { map[tallaUnidad.talla] = tallaUnidad.unidades; }
          return map;
        }, {}),
        Colores: coloresArray
      });
      const prendaId = docRef.id;

      for (let i = 0; i < this.imagenes.length; i++) {
      
        const imagen = this.imagenes[i]; // Se asume que this.imagenes contiene los archivos de imagen como objetos de tipo File
        const fileName = imagen.name; // Obtener el nombre del archivo
      
        // Generar la ruta de almacenamiento en Firebase Storage
        const filePath = `Ropa/${prendaId}/${fileName}`;
        const storageRef = this.storage.ref(filePath);
        
        await storageRef.put(imagen);
      }
    
      this.alerta.prendaAñadida();
      this.limpiarFormulario();
      this.mostrarFormulario = false;
    }

    getFileNameFromUrl(url: string): string {
      // Obtener el nombre del archivo de la URL
      const parts = url.split('/');
      return parts[parts.length - 1];
    }

    actualizarPrenda() {
      if (!this.prendaSeleccionada) { return; }
    const coloresArray = this.colores.map(color => color.toLowerCase());
    this.firestore.collection('ropa').doc(this.id).update({
        Nombre: this.nuevoProducto.nombre,
        Genero: this.nuevoProducto.genero,
        Descripcion: this.nuevoProducto.descripcion,
        Tipo: this.nuevoProducto.tipo,
        Precio: this.nuevoProducto.precio,
        Tallas: this.tallasUnidades.reduce((map: { [talla: string]: number }, tallaUnidad) => {
          if (tallaUnidad.talla && tallaUnidad.unidades) {
            map[tallaUnidad.talla] = tallaUnidad.unidades;
          }
          return map;
        }, {}),
        Colores: coloresArray
      }).then(() => {
        // Actualizar las imágenes en Firebase Storage (si es necesario)
        if (this.imagenes.length > 0) {
          this.subirImagenes(this.id);
        } else {
          this.limpiarFormulario();
        }
        this.limpiarFormulario();
        this.mostrarFormulario = false;
      }).catch(error => {
        console.error('Error al actualizar la prenda', error);
      });
    }


    async subirImagenes(prendaId: string): Promise<void> {

      for (let i = 0; i < this.imagenes.length; i++) {
      
        const imagen = this.imagenes[i]; // Se asume que this.imagenes contiene los archivos de imagen como objetos de tipo File
        const fileName = imagen.name; // Obtener el nombre del archivo
      
        // Generar la ruta de almacenamiento en Firebase Storage
        const filePath = `Ropa/${prendaId}/${fileName}`;
        const storageRef = this.storage.ref(filePath);
        await storageRef.put(imagen);
      }
  }
    
    
    

  cargarDatosPrenda(prendaId: string) {
    this.id = prendaId;
    const prendaRef = this.firestore.collection('ropa').doc(prendaId);
  
    prendaRef.get().subscribe((snapshot) => {
      if (snapshot.exists) {
        this.prendaSeleccionada = snapshot.data();
        this.nuevoProducto.nombre = this.prendaSeleccionada.Nombre;
        this.nuevoProducto.descripcion = this.prendaSeleccionada.Descripcion;
        this.nuevoProducto.genero = this.prendaSeleccionada.Genero;
        this.nuevoProducto.tipo = this.prendaSeleccionada.Tipo;
        this.nuevoProducto.precio = this.prendaSeleccionada.Precio;
        this.colores = this.prendaSeleccionada.Colores;
        this.tallasUnidades = Object.entries(this.prendaSeleccionada.Tallas).map(([talla, unidades]) => ({
          talla,
          unidades: unidades as number
        }));
    this.mostrarFormulario = true;
      }
    });
  }


  borrarPrenda(prendaId: string) {
    // Borrar el documento de la colección "ropa" en Firestore
    this.firestore.collection('ropa').doc(prendaId).delete()
      .then(() => {
        // Borrar las imágenes de la carpeta correspondiente en Firebase Storage
        const storageRef = this.storage.ref(`Ropa/${prendaId}`);
        storageRef.listAll().subscribe((result) => {
          result.items.forEach((itemRef) => {
            itemRef.delete();
          });
        });
      })
      .catch((error) => {
        console.error('Error al borrar la prenda:', error);
      });
  }

    nuevoArticulo(){
      this.limpiarFormulario();
      this.mostrarFormulario = true;
    }

    
    cancelarAgregarPrenda() {
      this.limpiarFormulario();
      this.mostrarFormulario = false;
    }
    
    limpiarFormulario() {
      this.nuevoProducto = { nombre: '',descripcion: '',talla: '',unidades: null,genero: '',tipo: '',precio: 0,colores: [],imagenes: []}
      this.nuevoColor
      this.tallasUnidades = [];
      this.colores = [];
      this.imagenes = [];
      this.nuevaPrenda = {};
    }
}


