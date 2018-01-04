import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { PLURAL_NAMES_TOKEN } from './interfaces';

export abstract class Pluralizer {
  abstract pluralize(name: string): string;
}

@Injectable()
// tslint:disable-next-line:class-name
export class _Pluralizer {
  private pluralNames: { [name: string]: string } = {};

  constructor(
    @Optional()
    @Inject(PLURAL_NAMES_TOKEN)
    pluralNames: { [name: string]: string }[]
  ) {
    // merge each plural names object
    if (pluralNames) {
      pluralNames.forEach(pn => Object.assign(this.pluralNames, pn));
    }
  }

  /**
   * Pluralize a singular name.
   * Examples: "hero" -> "heroes", "villain" -> "villains"
   */
  pluralize(name: string) {
    return this.pluralNames[name] || name + 's';
  }
}
