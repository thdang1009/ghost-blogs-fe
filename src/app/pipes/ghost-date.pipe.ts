import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as dateFns from 'date-fns';

@Pipe({
  name: 'simpleTime',
  pure: false
})
// xét xem thời gian đã cho là ngày hôm nay, hôm qua, ngày ngày mai, còn lại thì hiện là dd/mm
export class SimpleTimePipe implements PipeTransform {
  constructor(
    private datePipe: DatePipe
  ) { }
  transform(value: string) {
    const date = new Date(value);
    const isToDay = dateFns.isToday(date);
    const isTomorrow = dateFns.isTomorrow(date);
    const isYesterday = dateFns.isYesterday(date);
    if (isToDay) {
      return 'Hôm nay';
    } else if (isTomorrow) {
      return 'Ngày mai';
    } else if (isYesterday) {
      return 'Hôm qua';
    } else {
      return this.datePipe.transform(date, 'dd-MM');
    }
  }
}

