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
  totalFinal: number = 0;
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
  paymentCompleted: boolean = false;
  popup: any;

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
    if (this.paymentCompleted) {
      window.close(); // Cerrar la pestaña después de completar el pago
    }
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

  proceedToPayment(amount: number) {
    if (!this.isPaymentSelected) {
      console.log(this.isPaymentSelected);
      this.showErrorMessage = true;
      return;
    }
  
    this.paypalService.getAccessToken().subscribe(
      (response: any) => {
        const accessToken = response.access_token;
        console.log(accessToken);
        this.paypalService.createOrder(amount, accessToken).subscribe(
          (orderResponse: any) => {
            console.log('Orden de pago creada:', orderResponse);
            this.popup = window.open(orderResponse.links[1].href, '_blank', 'width=600,height=600');
            if (this.popup) {
              // Crea una función anónima para manejar el evento de mensaje
              const handleMessage = (event: MessageEvent) => {
                  console.log('entro');
                  this.popup.close(); // Cierra la ventana de PayPal
                  this.handlePaymentCompleted(amount); // Llama a la función para completar el pago
                  window.removeEventListener('message', handleMessage); // Elimina el event listener
                
              };
  
              window.addEventListener('message', handleMessage);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error en el pago',
                text: 'Ha ocurrido un error al procesar el pago. Por favor, inténtalo nuevamente.',
              });
            }
          },
          (error: any) => {
            Swal.fire({
              icon: 'error',
              title: 'Error en el pago',
              text: 'Ha ocurrido un error al procesar el pago. Por favor, inténtalo nuevamente.',
            });
          }
        );
      },
      (error: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Error en el pago',
          text: 'Ha ocurrido un error al procesar el pago. Por favor, inténtalo nuevamente.',
        });
      }
    );
  }
  

  handlePaymentCompleted(amount:number){
      Swal.fire({
        icon: 'success',
        title: 'Pago completado',
        text: '¡El pago se ha completado con éxito!',
      });
  
      // Crea el documento en Firebase
      const pedido = {
        idUsuario: this.user?.uid,
        estado: 'pendiente',
        fechaCreacion: new Date(),
        total: amount.toFixed(2) // Asegúrate de tener la variable "amount" accesible en este punto
      };
  
      // Llama a la función para guardar el pedido en Firebase
      this.guardarPedido(pedido);
      
      
    
  }
  
  
  guardarPedido(pedido: any) {
    this.firestore.collection('pedidos').add(pedido)
    this.router.navigate(['/home'])
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

  


