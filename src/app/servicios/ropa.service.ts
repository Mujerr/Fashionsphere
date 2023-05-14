import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { collection, getDocs, getFirestore } from "firebase/firestore"; // Agrega esta línea


@Injectable({
  providedIn: 'root'
})
export class RopaService {
 
sacaRopa(){
  //configuracion FIREBASE  
  const firebaseConfig = {
    apiKey: "AIzaSyCbOd7u1zHVHfH3NZGD0AFWvroridC3M8k",
    authDomain: "fashionsphere-50249.firebaseapp.com",
    projectId: "fashionsphere-50249",
    storageBucket: "fashionsphere-50249.appspot.com",
    messagingSenderId: "972000410221",
    appId: "1:972000410221:web:fbadfef704d56ced619d64",
    measurementId: "G-6M0VQSVBJJ"
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app); // Obtener referencia a la base de datos
  const ropaCollection = collection(db, "ropa"); // Obtener referencia a la colección "ropa"

    return new Observable<any>((observer) => {
      getDocs(ropaCollection).then((querySnapshot) => {
        const ropaData: { id: string; }[] = [];
        querySnapshot.forEach((doc) => {
          ropaData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        observer.next(ropaData);
        observer.complete();
      });
    });
  }
}
  