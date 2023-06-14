import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'firebase/auth';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  selectedLang = 'es';
  userLoggedIn: boolean | undefined;
  esAdmin$: Observable<boolean> | undefined;

  user: User | null = null;
  userName: string | null = '';
  userPhoto: string | null = '';
  textoBusqueda: string = '';

  constructor(
    public translate: TranslateService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private usuario: UsuarioService
  ) {
    translate.setDefaultLang('es');
    translate.use('es');
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      this.userLoggedIn = user ? true : false;
      this.user = user as User;
      if (user) {
        this.getUserData(user.uid);
      } else {
        this.userName = null;
        this.userPhoto = null;
      }
    });
      this.esAdmin$ = this.usuario.esUsuarioAdmin();
    }

  getUserData(uid: string) {
    this.firestore.collection('users').doc(uid).get().subscribe(
      (userDoc) => {
        if (userDoc.exists) {
          const userData = userDoc.data() as { username: string };
          this.userName = userData?.username || '';
          this.getUserPhoto(uid);
        } else {
          this.userName = null;
          this.userPhoto = null;
        }
      },
      (error) => {
        console.log('Error retrieving user data:', error);
        this.userName = null;
        this.userPhoto = null;
      }
    );
  }
  
  async getUserPhoto(uid: string) {
    try {
      const folderRef = this.storage.ref(`users/${uid}/`);
      const files = await folderRef.listAll().toPromise();
      
      if (files && files.items.length > 0) {
        const photoURL = await files.items[0].getDownloadURL();
        this.userPhoto = photoURL;
      } else {
        // Si no se encuentran archivos de imagen en la carpeta, puedes asignar null a userPhoto o una URL de imagen predeterminada
        this.userPhoto = null;
      }
    } catch (error) {
      console.log('Error al recuperar la foto del usuario:', error);
    }
  }


  logout() {
    this.afAuth
      .signOut()
      .then(() => {
        // Cierre de sesión exitoso
        this.router.navigate(['/inicioSesion']);
      })
      .catch(error => {
        // Maneja el error de cierre de sesión según tus necesidades
        console.log(error);
      });
  }


}