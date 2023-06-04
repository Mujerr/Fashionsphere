import { Component, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RopaService } from 'src/app/servicios/ropa.service';
import { ArticulosComponent } from '../articulos/articulos.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  @Input() aticulo: ArticulosComponent | undefined
  selectedLang = 'es';
  articulos: any[] = [];

  constructor(public translate: TranslateService,private rs:RopaService) {
    translate.setDefaultLang('es'); 
    translate.use('es'); 
  }
  ngOnInit(): void {
    this.rs.sacaRopa().subscribe(resp=>{ this.articulos = resp });
  }
}

