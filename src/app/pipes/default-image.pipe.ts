import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'defaultImage'
})
export class DefaultImagePipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) {
      // URL de la imagen por defecto
      return 'assets/img/default/default.jpg';
    }
    return value;
  }

}
