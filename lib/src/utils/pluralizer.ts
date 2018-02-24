import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';

export abstract class Pluralizer {
  abstract pluralize(name: string): string;
}
export const PLURAL_NAMES_TOKEN = new InjectionToken<{ [name: string]: string }>('ngrx-data/Plural Names');

@Injectable()
export class DefaultPluralizer {
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
