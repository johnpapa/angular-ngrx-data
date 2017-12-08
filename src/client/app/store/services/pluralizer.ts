import { Injectable } from '@angular/core';

export class Pluralizer {

  pluralNames: { [name: string]: string } = {
    hero: 'heroes'
  };

  /**
   * Pluralize a singular name.
   * Examples: "hero" -> "heroes", "villain" -> "villains"
   */
  pluralize(name: string) {
    return this.pluralNames[name] || name + 's';
  }
}
