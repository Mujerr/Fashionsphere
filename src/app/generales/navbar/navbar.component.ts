import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  selectedLang = 'es';

  constructor(public translate: TranslateService) {
    translate.setDefaultLang('es'); // Establece el idioma predeterminado
    translate.use('es'); // Utiliza el idioma predeterminado
  }

}
