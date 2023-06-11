import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
  
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent {
  userId: string = '';
  nombre: string= '';
  apellidos: string = '';
  username: string = '';
  direccion: string = '';
  telefono: string = '';
  isHovered: boolean = false;
  fotoPerfilUrl: string | null= ''; 
  previsualizacionFoto: any; // Variable para almacenar temporalmente la foto de perfil


  constructor(private firestore: AngularFirestore, 
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router:Router
    ) {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.getUserData();
        this.getUserPhoto(user.uid)
      }
    });
  }

  getUserData() {
    this.firestore.collection('users').doc(this.userId).valueChanges().subscribe((data: any) => {
      this.nombre = data.nombre;
      this.apellidos = data.apellidos;
      this.username = data.username;
      this.direccion = data.address;
      this.telefono = data.phone;
    });
  }

  async getUserPhoto(uid: string) {
      const folderRef = this.storage.ref(`users/${uid}/`);
      const files = await folderRef.listAll().toPromise();
      
      if (files && files.items.length > 0) {
        const photoURL = await files.items[0].getDownloadURL();
        this.fotoPerfilUrl = photoURL;
      } else {
        // Si no se encuentran archivos de imagen en la carpeta, puedes asignar null a userPhoto o una URL de imagen predeterminada
        this.fotoPerfilUrl = null;
      }
  }

  showChangePhoto() {
    this.isHovered = true;
  }

  hideChangePhoto() {
    this.isHovered = false;
  }

  guardarCambios() {
    const userData = {
      nombre: this.nombre,
      apellidos: this.apellidos,
      username: this.username,
      address: this.direccion,
      phone: this.telefono
    };
  
    this.firestore.collection('users').doc(this.userId).update(userData)
      .then(() => {
        // Llamar a uploadPhoto para subir la foto de perfil cuando se hayan guardado los cambios
        if (this.previsualizacionFoto) {
          this.uploadPhoto(this.previsualizacionFoto);
        } else {
          Swal.fire('Éxito', 'Cambios guardados correctamente.', 'success');
          this.router.navigate(['/home']);
        }
      })
      .catch(error => {
        Swal.fire('Error', 'Error al guardar los cambios: ' + error, 'error');
      });
  }

  openFilePicker() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      this.previsualizacionFoto = file; // Almacena la foto seleccionada en la variable de previsualización
      this.mostrarPrevisualizacion(file);
    });
    fileInput.click();
  }

  mostrarPrevisualizacion(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPerfilUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  
  uploadPhoto(file: File) {
    // Generar un nombre de archivo único para la nueva imagen de perfil
    const newFileName = `${file.name}`;
    const filePath = `users/${this.userId}/${newFileName}`; // Ruta del archivo en Firebase Storage
    const fileRef = this.storage.ref(filePath); // Referencia al archivo en Firebase Storage
  
    // Obtener una referencia a la carpeta del usuario
    const userFolderRef = this.storage.ref(`users/${this.userId}`);
  
    // Eliminar los archivos previos en la carpeta del usuario
    userFolderRef.listAll().toPromise()
      .then(result => {
        if (result && result.items) {
          const fileDeletionPromises = result.items.map(item => item.delete());
          return Promise.all(fileDeletionPromises);
        } else {
          return null;
        }
      })
      .then(() => {
        // Subir la nueva foto de perfil
        const task = this.storage.upload(filePath, file); // Subida del archivo
  
        task.snapshotChanges()
          .pipe(
            finalize(() => {
              fileRef.getDownloadURL().subscribe(downloadURL => {
                // Actualizar la URL de la foto de perfil en la colección 'users'
                this.firestore
                  .collection('users')
                  .doc(this.userId)
                  .update({ fotoPerfil: downloadURL })
              });
            })
          )
          .subscribe();
      })
  }

  validateTelefono() {
    if (this.telefono.length > 9) {
      this.telefono = this.telefono.slice(0, 9); // Truncate the phone number to 9 digits
    }
  }
  
}
