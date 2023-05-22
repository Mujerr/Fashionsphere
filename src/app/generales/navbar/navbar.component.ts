import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  selectedLang = 'es';
  userLoggedIn: boolean | undefined;

  constructor(public translate: TranslateService, private afAuth: AngularFireAuth, private router: Router) {
    translate.setDefaultLang('es'); 
    translate.use('es'); 
  }
  ngOnInit(){
    this.afAuth.authState.subscribe(user => {
      this.userLoggedIn = user ? true : false;
    });
  }
  logout() {
    this.afAuth.signOut()
      .then(() => {
        // Cierre de sesión exitoso
        this.router.navigate(['/inicioSesion']);
      })
      .catch((error) => {
        // Maneja el error de cierre de sesión según tus necesidades
        console.log(error);
      });
  }
}