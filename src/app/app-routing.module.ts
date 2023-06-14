import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home.component';
import { RegistrarseComponent } from './componentes/registrarse/registrarse.component';
import { IniciarSesionComponent } from './componentes/iniciar-sesion/iniciar-sesion.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { ArticuloComponent } from './componentes/articulo/articulo.component';
import { FavoritosComponent } from './componentes/favoritos/favoritos.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';
import { ComprarComponent } from './componentes/comprar/comprar.component';
import { DisenaRopaComponent } from './componentes/disena-ropa/disena-ropa.component';
import { TipoRopaComponent } from './componentes/tipo-ropa/tipo-ropa.component';
import { AdminComponentComponent } from './admin-component/admin-component.component';
import { BuscadorComponent } from './componentes/buscador/buscador.component';
import * as path from 'path';
import { PedidosComponent } from './componentes/pedidos/pedidos.component';

const routes: Routes = [
  {path:'home',component:HomeComponent},
  {path:'registrarse',component:RegistrarseComponent},
  {path:'inicioSesion',component:IniciarSesionComponent},
  {path:'perfil',component:PerfilComponent},
  {path:'articulo/:id',component:ArticuloComponent},
  {path:'favoritos',component:FavoritosComponent},
  {path:'carrito',component:CarritoComponent},
  {path:'comprar',component:ComprarComponent},
  {path:'designPrendas',component:DisenaRopaComponent},
  {path:'tipoRopa/:genero/:tipo',component:TipoRopaComponent},
  {path:'tipoRopa/:genero',component:TipoRopaComponent},
  {path:'buscador/:texto',component:BuscadorComponent},
  {path:'pedidos',component:PedidosComponent},
  { path: 'admin', component: AdminComponentComponent },
  {path:'**',pathMatch:'full', redirectTo:'home'},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
