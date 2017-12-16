import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';

export abstract class Pluralizer {
  abstract pluralize(name: string): string;
}

interface Indexable {
  [name: string]: string;
}

export const PLURALIZER_NAMES = new InjectionToken<Indexable>('PLURALIZER_NAMES');

@Injectable()
// tslint:disable-next-line:class-name
export class _Pluralizer {
  constructor(
    @Optional()
    @Inject(PLURALIZER_NAMES)
    private pluralNames: Indexable
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
