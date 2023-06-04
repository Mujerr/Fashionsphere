import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'firebase/auth';
import { PaypalService } from 'src/app/servicios/paypal.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comprar',
  templateUrl: './comprar.component.html',
  styleUrls: ['./comprar.component.css']
})
export class ComprarComponent {

  isPaymentSelected: boolean = false;
  paypalSelected: boolean = false;
  tarjetaSelected: boolean = false;
  showErrorMessage: boolean = false;
  userData: any = {}; // Propiedad para almacenar los datos del usuario
  totalFinal: number | undefined;
  user: User | null = null;
  updatedUserData: any = {}; // Propiedad para almacenar los datos actualizados del usuario

  editMode: any = {
    nombre: false,
    apellidos: false,
    phone: false,
    address: false,
    email: false
  };
  idUser: string | undefined;
  constructor(private paypalService:PaypalService,
              private afAuth: AngularFireAuth,  
              private firestore: AngularFirestore,
              private route: ActivatedRoute,
              private router: Router
              ){}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.totalFinal = +params['total'];
    });

    this.afAuth.authState.subscribe(user => {
      this.user = user as User;
      if (user) {
        this.idUser = user.uid
        this.sacarDatosUsuario(user.uid);
      } else {

      }
    });
  }   

  validatePaymentSelection() {
    if (this.paypalSelected || this.tarjetaSelected) {
      this.isPaymentSelected = true;
      this.showErrorMessage = false;
    } else {
      this.isPaymentSelected = false;
      this.showErrorMessage = true;
    }
  }

  proceedToPayment() {
    if (!this.isPaymentSelected) {
      console.log(this.isPaymentSelected);
      this.showErrorMessage = true;
      return;
    }
  
    const amount = 50.00;
    this.paypalService.getAccessToken().subscribe(
      (response: any) => {
        const accessToken = response.access_token;
        console.log(accessToken);
        this.paypalService.createOrder(amount, accessToken).subscribe(
          (orderResponse: any) => {
            console.log('Orden de pago creada:', orderResponse);
            const popup = window.open(orderResponse.links[1].href, '_blank', 'width=600,height=600');
            if (popup) {
              window.addEventListener('message', (event) => {
                if (event.origin === 'https://www.paypal.com' && event.data === 'payment_completed') {
                  this.paypalService.captureOrder(orderResponse.id, accessToken).subscribe(
                    (captureResponse: any) => {
                      console.log('Pago capturado:', captureResponse);
                      Swal.fire({
                        icon: 'success',
                        title: 'Compra finalizada',
                        text: '¡Gracias por tu compra!',
                      }).then(() => {
                        // Redirigir al componente seguimientoPedido
                        this.router.navigate(['/seguimientoPedido']);
                      });
                    },
                    (captureError: any) => {
                      console.error('Error al capturar el pago:', captureError);
                      Swal.fire({
                        icon: 'error',
                        title: 'Error en el pago',
                        text: 'Ha ocurrido un error al procesar el pago. Por favor, inténtalo nuevamente.',
                      });
                    }
                  );
                }
              });
            } else {
              console.error('No se pudo abrir la ventana emergente');
              Swal.fire({
                icon: 'error',
                title: 'Error en el pago',
                text: 'Ha ocurrido un error al procesar el pago. Por favor, inténtalo nuevamente.',
              });
            }
          },
          (error: any) => {
            console.error('Error al crear la orden de pago:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error en el pago',
              text: 'Ha ocurrido un error al procesar el pago. Por favor, inténtalo nuevamente.',
            });
          }
        );
      },
      (error: any) => {
        console.error('Error al obtener el token de acceso:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error en el pago',
          text: 'Ha ocurrido un error al procesar el pago. Por favor, inténtalo nuevamente.',
        });
      }
    );
  }
  
  

  captureOrder(orderId: string, accessToken: string) {
    this.paypalService.captureOrder(orderId, accessToken).subscribe(
      (captureResponse: any) => {
        console.log('Pago capturado:', captureResponse);
        Swal.fire({
          icon: 'success',
          title: 'Compra finalizada',
          text: '¡Gracias por tu compra!',
        }).then(() => {
          // Redirigir al componente seguimientoPedido
          this.router.navigate(['/seguimientoPedido']);
        });
      },
      (error: any) => { console.error('Error al capturar el pago:', error); }
    );
  }


  sacarDatosUsuario(userUid:string) {

    this.firestore.collection('users').doc(userUid).get().subscribe(
      (userDoc) => {
        if (userDoc.exists) {
           this.userData = userDoc.data() 
        }
      },
      (error) => {
        console.log('Error retrieving user data:', error);

      }
    );

  }

  activateEditMode(field: string) {
    this.editMode[field] = true;
  }

  cancelEditMode(field: string) {
    this.editMode[field] = false;
    this.userData[field] = this.userData[field]; // Restablecer el valor original del campo
  }

  saveUserData(field: string) {
    this.editMode[field] = false;
    this.userData[field] = this.updatedUserData[field]; // Actualizar el valor del campo con los datos actualizados
    this.updatedUserData[field] = ''; // Restablecer el valor actualizado del campo
  }


  updateField(field: string) {
    const userRef = this.firestore.collection('users').doc(this.idUser);
    const fieldValue = this.userData[field];

    userRef.update({ [field]: fieldValue })
      .then(() => {
        this.editMode[field] = false;
        console.log('Campo actualizado exitosamente en Firebase');
      })
      .catch((error) => {
        console.error('Error al actualizar el campo en Firebase:', error);
      });
  }

}

  


