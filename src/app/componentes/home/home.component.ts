import { Component, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RopaService } from 'src/app/servicios/ropa.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage, ref, uploadBytes, listAll, getDownloadURL } from '@angular/fire/storage';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ArticulosComponent } from '../articulos/articulos.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  @Input() aticulo: ArticulosComponent | undefined
  articulos: any[] = [];

  constructor(private translate: TranslateService, private http:HttpClient, private storage: AngularFireStorage, private rs:RopaService) {

  }
  ngOnInit(): void {
    this.rs.sacaRopa().subscribe(resp=>{
      this.articulos = resp
    });


  }
}

