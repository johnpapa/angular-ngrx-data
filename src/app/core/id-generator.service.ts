// Need a client-side id-generator for Villain,
// which is configured for optimistic ADD in EntityMetadata.
import { Injectable } from '@angular/core';

/*
 * DEMO ONLY client-side id (key) generator
 * The ids it generates are not guaranteed to be unique across all users.
 * DO NOT USE THIS GENERATOR.
 */
@Injectable()
export class IdGeneratorService {
  private counter = 1;

  /** Generate nextId for new entities with number keys */
  nextId(): number {
    return Date.now() + this.counter++;
  }
}
