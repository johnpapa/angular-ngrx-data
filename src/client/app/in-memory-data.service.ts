/**
 * Hero-oriented InMemoryDbService with method overrides.
 */
import { Injectable } from '@angular/core';

import { RequestInfo, RequestInfoUtilities, ParsedRequestUrl } from 'angular-in-memory-web-api';

import { Hero } from './model';

@Injectable()
export class InMemoryDataService {

  active = true;
  db: { heroes?: Hero[] } = {};

  createDb(reqInfo?: RequestInfo) {
    const heroes: Hero[] = [
      { id: 11, name: 'Mr. Nice',
        saying: 'Doggone it, people like me.' },
      { id: 12, name: 'Narco', saying: 'Sleep, my pretty!' },
      { id: 13, name: 'Bombasto', saying: 'I am the greatest!' },
    ];

    if (reqInfo) {
      const body = reqInfo.utils.getJsonBody(reqInfo.req) || {};
      if (body.clear === true) {
        heroes.length = 0;
      }

      this.active = !!body.active;

    }
    return this.db = { heroes } ;
  }

  // parseRequestUrl override
  // Manipulates the request URL or the parsed result.
  // If in-mem is inactive, clear collectionName so that service passes request thru.
  // If in-mem is active,
  // remap a URL that would designate a "hero" collection to the "heroes" collection
  // after parsing with the default parser.
  parseRequestUrl(url: string, utils: RequestInfoUtilities): ParsedRequestUrl {
    const parsed = utils.parseRequestUrl(url);
    if (this.active) {
      if (parsed.collectionName === 'hero') { parsed.collectionName = 'heroes'; }
    } else {
      parsed.collectionName = undefined;
    }
    return parsed;
  }
}
