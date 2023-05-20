import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  selectedLang = 'es';

  constructor(public translate: TranslateService) {
    translate.setDefaultLang('es'); 
    translate.use('es'); 
  }
}