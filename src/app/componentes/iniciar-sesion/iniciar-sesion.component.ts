import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.component.html',
  styleUrls: ['./iniciar-sesion.component.css']
})
export class IniciarSesionComponent{
  email: string ="";
  password: string ="";

  constructor(private afAuth: AngularFireAuth,private router: Router) {}


  loginWithEmail() {
    this.afAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
      return this.afAuth.signInWithEmailAndPassword(this.email, this.password);
    })
    .then((credential) => {
      this.router.navigate(['/home']);
      console.log('Inicio de sesión exitoso', credential.user);
    })
    .catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Usuario no encontrado',
        text: 'Usuario o contraseña incorrectos',
      })
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
