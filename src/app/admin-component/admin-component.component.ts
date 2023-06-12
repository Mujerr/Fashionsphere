import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UsuarioService } from '../servicios/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-component',
  templateUrl: './admin-component.component.html',
  styleUrls: ['./admin-component.component.css']
})
export class AdminComponentComponent {
  users: any[] = []; // Array para almacenar los usuarios
  prendas: any[] = []; // Array para almacenar las prendas
  isAdmin: boolean = false;

  constructor(private firestore: AngularFirestore,
              private usuario:UsuarioService,
              private router:Router) {}

  ngOnInit() {
    this.usuario.esUsuarioAdmin().subscribe(isAdmin => {
      if (!isAdmin) {
        // Si el usuario no es administrador, redireccionar a otra página
        this.router.navigate(['/acceso-denegado']);
      } else {
        this.isAdmin = true;
      }
    })
      // Obtener los usuarios
      this.firestore.collection('users').valueChanges().subscribe((users: any[]) => {
        this.users = users;
      });
  
      // Obtener las prendas
      this.firestore.collection('ropa').valueChanges().subscribe((prendas: any[]) => {
        this.prendas = prendas;
      });
    }

    borrarUsuario(userId: number) {
      // Lógica para borrar el usuario con el ID especificado
    }
  
    modificarPrenda(prendaId: number) {
      // Lógica para modificar la prenda con el ID especificado
    }
  
    borrarPrenda(prendaId: number) {
      // Lógica para borrar la prenda con el ID especificado
    }
  
    modificarEstadoPedido(pedidoId: number) {
      // Lógica para modificar el estado del pedido con el ID especificado
    }
}
