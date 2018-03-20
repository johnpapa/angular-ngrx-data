import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';

export const PLURAL_NAMES_TOKEN = new InjectionToken<EntityPluralNames>('ngrx-data/Plural Names');

export abstract class Pluralizer {
  abstract pluralize(name: string): string;
}

/**
 * Mapping of entity type name to its plural
 */
export interface EntityPluralNames {
  [entityName: string]: string
}

@Injectable()
export class DefaultPluralizer {
  pluralNames: EntityPluralNames = {};

  constructor(
    @Optional()
    @Inject(PLURAL_NAMES_TOKEN)
    pluralNames: EntityPluralNames[]
  ) {
    // merge each plural names object
    if (pluralNames) {
      pluralNames.forEach(pn => this.registerPluralNames(pn));
    }
  }

  /**
   * Pluralize a singular name.
   * Examples: "hero" -> "heroes", "villain" -> "villains"
   */
  pluralize(name: string) {
    return this.pluralNames[name] || name + 's';
  }

    /**
   * Register a mapping of entity type name to the entity name's plural
   * @param pluralNames {EntityPluralNames} plural names for entity types
   */
  registerPluralNames( pluralNames: EntityPluralNames): void {
    this.pluralNames = { ...this.pluralNames, ...(pluralNames || {}) };
  }
}
