import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  usurio: string | undefined;

  constructor(private translate: TranslateService) {
    this.translate.get('Usuario').subscribe((res: string) => {
      this.usurio = res;
    });
  }
}
