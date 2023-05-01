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

//I18N imports 
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    IniciarSesionComponent,
    RegistrarseComponent,
    CarritoComponent,
    PerfilComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
        deps: [HttpClient]
      },
      defaultLanguage: 'es',
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
