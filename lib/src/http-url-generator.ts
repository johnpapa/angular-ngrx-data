import { Injectable } from '@angular/core';
import { Pluralizer } from './pluralizer';

/**
 * Generate the base part of an HTTP URL for
 * single entity or entity collection resource
 */
export abstract class HttpUrlGenerator {
  /**
   * Return the base URL for a single entity resource,
   * e.g., the base URL to get a single hero by its id
   */
  abstract entityResource(entityName: string, root: string): string;

  /**
   * Return the base URL for a collection resource,
   * e.g., the base URL to get all heroes
   */
  abstract collectionResource(entityName: string, root: string): string;
}

export class DefaultHttpUrlGenerator implements HttpUrlGenerator {
  constructor(private pluralizer: Pluralizer) { }

  entityResource(entityName: string, root: string): string {
    root = normalizeRoot(root);
    return `${root}/${entityName}/`.toLowerCase();
  }
  collectionResource(entityName: string, root: string): string {
    root = normalizeRoot(root);
    const entitiesName = this.pluralizer.pluralize(entityName);
    return `${root}/${entitiesName}/`.toLowerCase();
  }
}

/** Remove leading & trailing spaces or slashes */
export function normalizeRoot(root: string) {
  return root.replace(/^[\/\s]+|[\/\s]+$/g, '');
}
