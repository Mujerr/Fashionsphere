import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root'
})
export class AlertasService {

  constructor(private router:Router) { }

  agregarCarrito(){
    return Swal.fire({
      icon: 'success',
      title: 'Artículo agregado al carrito',
      text: 'El artículo se ha añadido correctamente al carrito',
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6',
      customClass: {
        title: 'swal-title',
        confirmButton: 'swal-button',
      },
      iconHtml: '<i class="fas fa-shopping-cart"></i>',
    });
  }

  errorAgregarCarrito(){
    return Swal.fire({
      icon: 'error',
      title: 'Error al agregar artículo al carrito',
      text: 'Ha ocurrido un error al intentar agregar el artículo al carrito. Por favor, inténtalo de nuevo más tarde.',
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6',
      customClass: {
        title: 'swal-title',
        confirmButton: 'swal-button',
      },
    });  
  }

  errorAgregarFavorito(){
    return Swal.fire({
      icon: 'error',
      title: 'Error al agregar artículo a favoritos',
      text: 'Ha ocurrido un error al intentar agregar el artículo a favoritos. Por favor, inténtalo de nuevo más tarde.',
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6',
      customClass: {
        title: 'swal-title',
        confirmButton: 'swal-button',
      },
    });  
  }

  noAutenticado(){
    Swal.fire({
      icon: 'info',
      title: 'Por favor, inicia sesión o regístrate',
      text: 'Para realizar esta acción, necesitas iniciar sesión o registrarte en nuestra plataforma.',
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: 'Iniciar sesión',
      confirmButtonColor: '#3085d6',
      customClass: {
        title: 'swal-title',
        confirmButton: 'swal-button',
      },
    }).then((result) => {
      if (result.isConfirmed) {
         this.router.navigate(['/login']);
      }
    });
    
  }
}
