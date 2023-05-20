import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';



@Component({
  selector: 'app-carrousel',
  templateUrl: './carrousel.component.html',
  styleUrls: ['./carrousel.component.css']
})
export class CarrouselComponent implements OnInit{

  constructor(private storage: AngularFireStorage,){}  
  imageUrls: string[] = [];

  ngOnInit(): void {
   const ref = this.storage.ref('Portadas');
   ref.listAll().subscribe((result) => {
     const urls: string[] = [];
     result.items.forEach((item) => {
       item.getDownloadURL().then((url) => urls.push(url));
     });
     this.imageUrls = urls;
   });

  }
}
