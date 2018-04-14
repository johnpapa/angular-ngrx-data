import { Injectable } from '@angular/core';

export abstract class Logger {
  abstract error(message?: any, ...optionalParams: any[]): void;
  abstract log(message?: any, ...optionalParams: any[]): void;
  abstract warn(message?: any, ...optionalParams: any[]): void;
}

@Injectable()
export class DefaultLogger implements Logger {
  error(message?: any, ...optionalParams: any[]) {
    if (message == null) {
      return;
    }
    console.error(message, optionalParams);
  }

  log(message?: any, ...optionalParams: any[]) {
    if (message == null) {
      return;
    }
    console.log(message, optionalParams);
  }

  warn(message?: any, ...optionalParams: any[]) {
    if (message == null) {
      return;
    }
    console.warn(message, optionalParams);
  }
}
