import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

function toFixedNoTrailingZeros(n: number, maxDigits: number): string {
  return n.toFixed(maxDigits).replace(/\.0+$/, '').replace(/(\.\d+?)0+$/, '$1');
}

@Injectable({
  providedIn: 'root'
})
export class FormatService {
  constructor(private datePipe: DatePipe) {}

  format(value: number | null | undefined, unit: string | null | undefined, asSexagesimal = false): string | null | undefined {
    if (value == null) {
      return value;
    } else if (/HOURS/i.test(unit ?? '')) { // Unit is called HOURS, but values are in minutes!
      return this.formatAsHours(value, asSexagesimal);
    } else {
      return toFixedNoTrailingZeros(value, 4);
    }
  }

  formatAsHours(minutes: number | null | undefined, asSexagesimal = false): string | null | undefined {
    let formatted: string;

    if (minutes == null) {
      return minutes;
    } else if (!asSexagesimal) {
      formatted = toFixedNoTrailingZeros(minutes / 60, 2);
    } else {
      const sign = (minutes < 0 ? '-' : '');
      minutes = Math.round(Math.abs(minutes));
      const hours = Math.floor(minutes / 60);
      formatted = `${sign}${hours}:${(minutes % 60 + 100).toString().substr(1)}`.replace(/:00$/, '');
    }

    return formatted;
  }

  formatDate(date: Date | null | undefined): string | null | undefined {
    if (date == null) {
      return date;
    } else {
      return this.datePipe.transform(date, 'dd-MMM-yy');
    }
  }
}
