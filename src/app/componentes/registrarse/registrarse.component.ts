import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { GoogleAuthProvider } from 'firebase/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  nombre: string = '';
  apellidos:string = '';
  username: string = '';
  profilePicture:string = '';
  selectedProfilePicture: File | null = null;

  constructor(private afAuth: AngularFireAuth,   private firestore: AngularFirestore, private storage: AngularFireStorage, private router:Router) {}

  onFileSelected(event: any) {
    this.selectedProfilePicture = event.target.files[0];
  }
 


  registerWithEmail(registerForm: any) {
    if (registerForm.valid) {
      const email = this.email;
      const password = this.password;
      const phone = this.phone;
      const address = this.address;
      const nombre = this.nombre;
      const apellidos = this.apellidos;
      const username = this.username;
      const profilePicture = this.profilePicture;

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
              address: address,
              profilePicture: '' ,
              nombre:nombre,
              apellidos:apellidos,

              username:username
            };
  
            // Obtener la referencia al documento del usuario en la colección 'users'
            const userRef = this.firestore.collection('users').doc(user.uid);
  
            // Guardar los datos adicionales en el documento del usuario
            userRef.set(userData)
              .then(() => {
                this.router.navigate(['/home']);
              })
              .catch((error) => { this.errorRegistro(); });

    if (this.selectedProfilePicture) {

      const filePath = `users/${user.uid}/${this.selectedProfilePicture.name.includes(user.uid)}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedProfilePicture);
  
      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url: any) => {
            // Actualizar el campo profilePicture en el objeto userData con la URL de la foto de perfil
            userData.profilePicture = url;
  
            // Guardar los datos adicionales del usuario en la base de datos
            userRef.set(userData)
              .then(() => {
                this.router.navigate(['/home']);
                // Aquí puedes redirigir al usuario a otra página o realizar otras acciones
              })
              .catch((error) => { this.errorRegistro(); });
          });
        })
      ).subscribe();
    } else {
      // Si no se seleccionó ninguna imagen, guardar los datos adicionales del usuario sin la URL de la foto de perfil
      userRef.set(userData)
        .then(() => {
          this.router.navigate(['/home']);

          // Aquí puedes redirigir al usuario a otra página o realizar otras acciones
        })
        .catch((error) => { this.errorRegistro(); });

    }
    } else { this.errorRegistro(); }
  })
  .catch((error) => { this.errorRegistro(); });
  
    // Reiniciar los campos del formulario después del registro
    registerForm.reset();
  }
  }
  

  registerWithGoogle() {
    this.afAuth.signInWithPopup(new GoogleAuthProvider())
      .then((result) => {
        // Obtener el usuario autenticado
        const user = result.user;
        const profilePicture = user?.photoURL
        if (user) {
          // Guardar datos adicionales del usuario en la base de datos
          const userData = {
            email: user.email,
            phone: this.phone,
            address: this.address,
            nombre:this.nombre,
            apellidos:this.apellidos,
            username:user.email,
            profilePicture: profilePicture
          };
  
          this.firestore.collection('users').doc(user.uid).set(userData)
            .then(() => {
              this.router.navigate(['/home']);
              // Aquí puedes redirigir al usuario a otra página o realizar otras acciones
            })
            .catch((error) => { this.errorRegistro(); });
  
          // Reiniciar los campos del formulario después del registro
          this.email = '';
          this.password = '';
          this.phone = '';
          this.address = '';
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
      title: 'no se ha podido registrar el usuario',
    }) 
  }
}
