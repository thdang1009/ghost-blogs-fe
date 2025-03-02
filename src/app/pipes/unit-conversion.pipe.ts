import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unitConversion'
})
export class UnitConversionPipe implements PipeTransform {
  config = {
    'B': 1,
    'kB': 1 * 2 ** 10,
    'MB': 1 * 2 ** 10 * 2 ** 10,
    'GB': 1 * 2 ** 10 * 2 ** 10 * 2 ** 10
  }

  transform(value: any, ...args: any[]): number {
    // console.log('abo', value, args);
    const arr = args[0].split('-') || [];
    const from = this.config[arr[0] as keyof typeof this.config];
    const to = this.config[arr[1] as keyof typeof this.config];
    const result = Math.floor(Number(value) * (from / to));
    return result;
  }

}
