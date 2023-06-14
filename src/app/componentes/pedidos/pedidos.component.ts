import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent {
  pedidos: any[] = [];
  userId: string = '';

  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth) {}

  ngOnInit() {
    this.getUserId();
  }

  getUserId(): void {
    this.auth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        this.fetchPedidos();
      } else {
        // Si no hay un usuario autenticado, manejar el caso de error aquí
        console.error('No se ha encontrado un usuario autenticado');
      }
    });
  }

  fetchPedidos() {
    this.firestore
      .collection('pedidos', (ref) => ref.where('idUsuario', '==', this.userId))
      .valueChanges()
      .subscribe(
        (pedidos: any[]) => {
          this.pedidos = pedidos;
        },
        (error: any) => {
          console.error('Error al obtener los pedidos:', error);
        }
      );
  }
}
