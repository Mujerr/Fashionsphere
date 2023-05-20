import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.component.html',
  styleUrls: ['./iniciar-sesion.component.css']
})
export class IniciarSesionComponent {
  email: string ="";
  password: string ="";

  constructor(private afAuth: AngularFireAuth) {}

  loginWithEmail() {
    this.afAuth.signInWithEmailAndPassword(this.email, this.password)
      .then((userCredential) => {
        // Inicio de sesión exitoso
        console.log(userCredential);
        // Realiza alguna acción adicional si es necesario
      })
      .catch((error) => {
        // Error en el inicio de sesión
        console.log(error);
        // Maneja el error de inicio de sesión de acuerdo a tus necesidades
      });
  }

  loginWithGoogle() {
    this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((userCredential) => {
        // Inicio de sesión con Google exitoso
        console.log(userCredential);
        // Realiza alguna acción adicional si es necesario
      })
      .catch((error) => {
        // Error en el inicio de sesión con Google
        console.log(error);
        // Maneja el error de inicio de sesión de acuerdo a tus necesidades
      });
  }
}
