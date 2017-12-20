import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { PLURAL_NAMES_TOKEN } from './interfaces';

export abstract class Pluralizer {
  abstract pluralize(name: string): string;
}

@Injectable()
// tslint:disable-next-line:class-name
export class _Pluralizer {
  constructor(
    @Optional()
    @Inject(PLURAL_NAMES_TOKEN)
    private pluralNames: { [name: string]: string; }
  ) {
    this.pluralNames = pluralNames || {};
  }

  /**
   * Pluralize a singular name.
   * Examples: "hero" -> "heroes", "villain" -> "villains"
   */
  pluralize(name: string) {
    return this.pluralNames[name] || name + 's';
  }
}
