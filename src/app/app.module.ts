import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './generales/navbar/navbar.component';
import { HomeComponent } from './componentes/home/home.component';
import { IniciarSesionComponent } from './componentes/iniciar-sesion/iniciar-sesion.component';
import { RegistrarseComponent } from './componentes/registrarse/registrarse.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
//otros imports
import { FormsModule } from '@angular/forms'; // importa FormsModule

//firebase 
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { firebaseConfig } from './enviroments/enviroment.config'

//I18N imports 
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

//imports de servicios
import { RopaService } from './servicios/ropa.service';
import { ArticulosComponent } from './componentes/articulos/articulos.component';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    IniciarSesionComponent,
    RegistrarseComponent,
    CarritoComponent,
    PerfilComponent,
    ArticulosComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireStorageModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
        deps: [HttpClient]
      },
      defaultLanguage: 'es',
    })
  ],
  providers: [RopaService],
  bootstrap: [AppComponent]
})
export class AppModule { }