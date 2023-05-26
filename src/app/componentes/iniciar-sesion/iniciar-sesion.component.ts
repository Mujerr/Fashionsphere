import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
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

  constructor(private afAuth: AngularFireAuth,private router: Router, private firestore: AngularFirestore) {}


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
    this.afAuth.signInWithPopup(new GoogleAuthProvider())
    .then((result) => {
      // Obtener el usuario autenticado
      const user = result.user;
      if (user) {
        // Guardar datos adicionales del usuario en la base de datos
        const userData = {
          email: user.email,
          username:user.email,
        };

        this.firestore.collection('users').doc(user.uid).set(userData)
          .then(() => {
            this.router.navigate(['/home']);
            // Aquí puedes redirigir al usuario a otra página o realizar otras acciones
          })
          .catch((error) => { this.errorRegistro(); });

      } else {
        this.errorRegistro();
      }
    })
    .catch((error) => {
      this.errorRegistro();
    });
    }
    
    errorRegistro(){
      Swal.fire({
        icon: 'error',
        title: 'no se ha podido iniciar sesion con el usuario',
      }) 
    }
}
