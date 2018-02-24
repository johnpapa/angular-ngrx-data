import { TestBed } from '@angular/core/testing';

import { Pluralizer, DefaultPluralizer, PLURAL_NAMES_TOKEN } from './pluralizer'

describe('Pluralizer (_Pluralizer)', () => {

  let pluralizer: Pluralizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Pluralizer, useClass: DefaultPluralizer }
      ]
    });
  })

  describe('with injected names', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          // Demonstrate multi-provider
          { provide: PLURAL_NAMES_TOKEN, multi: true, useValue: { Hero: 'Heroes' } },
          { provide: PLURAL_NAMES_TOKEN, multi: true, useValue: { Ox: 'Oxes' } },
          // Demonstrate overwrite of Ox and setting several names
          { provide: PLURAL_NAMES_TOKEN, multi: true,
            useValue: { Ox: 'Oxen', Elephant: 'Elephant' } }
        ]
      });

      pluralizer = TestBed.get(Pluralizer);
    });

    it('can pluralize "Villain" which is not in plural names', () => {
      // default pluralization with 's'
      expect(pluralizer.pluralize('Villain')).toBe('Villains');
    });

    it('can pluralize "Hero" using plural names', () => {
      expect(pluralizer.pluralize('Hero')).toBe('Heroes');
    });

    it('should be case sensitive', () => {
      // uses default pluralization rule, not the names map
      expect(pluralizer.pluralize('hero')).toBe('heros');
    });

    it('can pluralize "Elephant" using later plural name map', () => {
      expect(pluralizer.pluralize('Elephant')).toBe('Elephant');
    });

    it('later plural name map replaces earlier one', () => {
      expect(pluralizer.pluralize('Ox')).toBe('Oxen');
    });
  });

  describe('without injected names', () => {

    it('should work when no injected plural names', () => {
      pluralizer = TestBed.get(Pluralizer);
      // No map so 'Hero' gets default pluralization
      expect(pluralizer.pluralize('Hero')).toBe('Heros');
    });
  });
});
