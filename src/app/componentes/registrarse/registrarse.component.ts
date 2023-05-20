import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { GoogleAuthProvider } from 'firebase/auth';

@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.component.html',
  styleUrls: ['./registrarse.component.css']
})
export class RegistrarseComponent {
  email: string = '';
  password: string = '';
  phone: string = '';
  address: string = '';

  constructor(private afAuth: AngularFireAuth,   private firestore: AngularFirestore
    ) {}

  registerWithEmail(registerForm: any) {
    if (registerForm.valid) {
      const email = this.email;
      const password = this.password;
      const phone = this.phone;
      const address = this.address;
  
      // Aquí puedes realizar el registro con el email y la contraseña en Firebase
      // Puedes utilizar el servicio AngularFireAuth para esto
      this.afAuth.createUserWithEmailAndPassword(email, password)
        .then((credential) => {
          const user = credential.user; // Obtener el usuario autenticado
  
          if (user) {
            // Guardar datos adicionales del usuario en la base de datos
            const userData = {
              email: email,
              phone: phone,
              address: address
            };
  
            // Obtener la referencia al documento del usuario en la colección 'users'
            const userRef = this.firestore.collection('users').doc(user.uid);
  
            // Guardar los datos adicionales en el documento del usuario
            userRef.set(userData)
              .then(() => {
                console.log("Datos adicionales del usuario guardados correctamente");
                // Aquí puedes redirigir al usuario a otra página o realizar otras acciones
              })
              .catch((error) => {
                console.log("Error al guardar datos adicionales del usuario:", error);
              });
          } else {
            console.log("No se ha encontrado el usuario autenticado");
          }
  
          // Reiniciar los campos del formulario después del registro
          registerForm.reset();
        })
        .catch((error) => {
          console.log("Error al registrar usuario con correo electrónico y contraseña:", error);
        });
    }
  }
  

  registerWithGoogle() {
    this.afAuth.signInWithPopup(new GoogleAuthProvider())
      .then((result) => {
        // Obtener el usuario autenticado
        const user = result.user;
  
        if (user) {
          // Guardar datos adicionales del usuario en la base de datos
          const userData = {
            email: user.email,
            phone: this.phone,
            address: this.address
          };
  
          this.firestore.collection('users').doc(user.uid).set(userData)
            .then(() => {
              console.log("Datos adicionales del usuario guardados correctamente");
              // Aquí puedes redirigir al usuario a otra página o realizar otras acciones
            })
            .catch((error) => {
              console.log("Error al guardar datos adicionales del usuario:", error);
            });
  
          // Reiniciar los campos del formulario después del registro
          this.email = '';
          this.password = '';
          this.phone = '';
          this.address = '';
        } else {
          console.log("No se ha encontrado el usuario autenticado");
        }
      })
      .catch((error) => {
        console.log("Error al registrarse con Google:", error);
      });
  }
  
}
