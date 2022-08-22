import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hydra',
})
export class HydraPipe implements PipeTransform {
  constructor() { }

  transform(value: number): number {
    return value / 10 ** 18;
    //return parseInt(value, 10) / 10 ** 8;
  }
}
