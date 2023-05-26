import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home.component';
import { RegistrarseComponent } from './componentes/registrarse/registrarse.component';
import { IniciarSesionComponent } from './componentes/iniciar-sesion/iniciar-sesion.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { ArticuloComponent } from './componentes/articulo/articulo.component';
import { FavoritosComponent } from './componentes/favoritos/favoritos.component';

const routes: Routes = [
  {path:'home',component:HomeComponent},
  {path:'registrarse',component:RegistrarseComponent},
  {path:'inicioSesion',component:IniciarSesionComponent},
  {path:'perfil',component:PerfilComponent},
  {path:'articulo/:id',component:ArticuloComponent},
  {path:'favoritos',component:FavoritosComponent},

  {path:'**',pathMatch:'full', redirectTo:'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
