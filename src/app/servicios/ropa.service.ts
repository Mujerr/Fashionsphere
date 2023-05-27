import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { collection, getDocs, getFirestore } from "firebase/firestore"; // Agrega esta línea
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map,mergeMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class RopaService {
  constructor(private firestore: AngularFirestore) {}

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

  getArticulo(id: string): Observable<any> {
    return this.firestore.collection('ropa').doc(id).valueChanges();
  }

  
  getPrendasFavoritasByUserId(userId: string): Observable<any[]> {
    return this.firestore.collection('favoritosGuardado')
      .doc(userId)
      .snapshotChanges()
      .pipe(
        map(snapshot => {
          const data = snapshot.payload.data() as { [key: string]: { colors: string[] } };
          const prendas: Observable<any>[] = [];
  
          if (data) {
            for (const prendaId in data) {
              if (data.hasOwnProperty(prendaId)) {
                const colors = data[prendaId].colors;
  
                colors.forEach(color => {
                  const prenda$ = this.getPrendaById(prendaId).pipe(
                    map(prenda => {
                      return {
                        id: prendaId,
                        userId: userId,
                        prendaId: prendaId,
                        color: color,
                        ...prenda
                      };
                    })
                  );
  
                  prendas.push(prenda$);
                });
              }
            }
          }
  
          return prendas.length > 0 ? combineLatest(prendas) : of([]);
        }),
        mergeMap(observables => {
          return observables;
        })
      );
  }

  // Obtiene los datos de una prenda por ID
  getPrendaById(id: string): Observable<any> {
    return this.firestore.collection('ropa').doc(id).snapshotChanges()
      .pipe(
        map(snapshot => {
          const data = snapshot.payload.data();
          const snapshotId = snapshot.payload.id;
          if (typeof data === 'object' && data !== null) {
            return { id: snapshotId, ...data };
          } else {
            return { id: snapshotId };
          }
        })
      );
  }

}
  