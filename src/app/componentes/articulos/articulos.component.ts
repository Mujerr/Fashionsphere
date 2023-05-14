import { Component, Input, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { RopaService } from 'src/app/servicios/ropa.service';

@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.css']
})
export class ArticulosComponent implements OnInit {

imageUrls: string[] = [];
isHovering = false;

@Input() articulos:any ={}
@Input() idRopa:string |undefined;
@Input() colores:string | undefined;
constructor(private rs:RopaService,private storage: AngularFireStorage,){

}
  ngOnInit(): void {
    const ref = this.storage.ref(`Ropa/${this.idRopa}`);
    ref.listAll().subscribe((result) => {
      // Transformar la lista de objetos Reference en un arreglo de Promesas de URLs
      const promises: Promise<string>[] = result.items.map((item) => item.getDownloadURL());
      // Esperar a que se completen todas las Promesas
      Promise.all(promises).then((urls) => {
        // Asignar el arreglo de URLs a la propiedad imageUrls
        this.imageUrls = urls;
      });
    });
  }
  selectColor(color:string){
      const ref = this.storage.ref(`Ropa/${this.idRopa}/${color}.jpg`);
      ref.getDownloadURL().subscribe(url => {
        this.imageUrls = url;
      });
  }
}
