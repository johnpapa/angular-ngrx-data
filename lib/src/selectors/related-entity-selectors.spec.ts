import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Action,
  createSelector,
  Selector,
  StoreModule,
  Store
} from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { skip } from 'rxjs/operators/skip';

import {
  EntityAction,
  EntityActions,
  EntityActionFactory,
  EntityOp
} from '../actions';

import { EntityCache, EntityCollection } from '../reducers';

import {
  EntityMetadata,
  EntityMetadataMap,
  ENTITY_METADATA_TOKEN
} from '../entity-metadata/entity-metadata';

import { EntitySelectors$Factory } from '../selectors/entity-selectors$';

import { _NgrxDataModuleWithoutEffects } from '../ngrx-data.module';

import { Dictionary, Update } from '../utils/ngrx-entity-models';

const entityMetadataMap: EntityMetadataMap = {
  Hero: {},
  HeroPowerMap: {},
  Power: {},
  Sidekick: {}
};

describe('Related-entity Selectors', () => {
  // #region setup
  let eaFactory: EntityActionFactory;
  let entitySelectors$Factory: EntitySelectors$Factory;
  let store: Store<EntityCache>;

  let selectHeroCollection: Selector<Object, EntityCollection<Hero>>;
  let selectHeroMap: Selector<Object, Dictionary<Hero>>;
  let selectSidekickCollection: Selector<Object, EntityCollection<Sidekick>>;
  let selectSidekickMap: Selector<Object, Dictionary<Hero>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), _NgrxDataModuleWithoutEffects],
      providers: [
        // required by NgrxData but not used in these tests
        { provide: EntityActions, useValue: null },
        {
          provide: ENTITY_METADATA_TOKEN,
          multi: true,
          useValue: entityMetadataMap
        }
      ]
    });

    store = TestBed.get(Store);
    eaFactory = TestBed.get(EntityActionFactory);
    entitySelectors$Factory = TestBed.get(EntitySelectors$Factory);
    initializeCache(eaFactory, store);
    setCollectionSelectors();
  });

  /** Collection selectors. Used within related-entity selectors */
  function setCollectionSelectors() {
    selectHeroCollection = entitySelectors$Factory.createCollectionSelector<
      Hero
    >('Hero');

    selectHeroMap = createSelector(
      selectHeroCollection,
      collection => collection.entities
    );

    selectSidekickCollection = entitySelectors$Factory.createCollectionSelector<
      Sidekick
    >('Sidekick');

    selectSidekickMap = createSelector(
      selectSidekickCollection,
      collection => collection.entities
    );
  }

  // #endregion setup

  describe('hero sidekick', () => {
    function createHeroSidekickSelector$(heroId: number): Observable<Sidekick> {
      const selectSideKick = createSelector(
        selectHeroMap,
        selectSidekickMap,
        (heroes, sidekicks) => {
          const hero = heroes[heroId];
          const sidekickId = hero && hero.sidekickFk;
          return sidekicks[sidekickId];
        }
      );
      return store.select(selectSideKick);
    }

    it('can get Alpha Hero sidekick', (done: DoneFn) => {
      createHeroSidekickSelector$(1).subscribe(sk => {
        expect(sk.name).toBe('Bob');
        done();
      });
    });

    it('should get Alpha Hero updated sidekick', (done: DoneFn) => {
      // Skip the initial sidekick and check the one after update
      createHeroSidekickSelector$(1)
        .pipe(skip(1))
        .subscribe(sk => {
          expect(sk.name).toBe('Robert');
          done();
        });

      // update the related sidekick
      const action = eaFactory.create<Update<Sidekick>>(
        'Sidekick',
        EntityOp.UPDATE_ONE,
        { id: 1, changes: { id: 1, name: 'Robert' } }
      );
      store.dispatch(action);
    });

    it('should get Alpha Hero changed sidekick', (done: DoneFn) => {
      // Skip the initial sidekick and check the one after update
      createHeroSidekickSelector$(1)
        .pipe(skip(1))
        .subscribe(sk => {
          expect(sk.name).toBe('Sally');
          done();
        });

      // update the hero's sidekick from fk=1 to fk=2
      const action = eaFactory.create<Update<Hero>>(
        'Hero',
        EntityOp.UPDATE_ONE,
        { id: 1, changes: { id: 1, sidekickFk: 2 } } // Sally
      );
      store.dispatch(action);
    });

    it('should get undefined sidekick from Gamma because it has no sidekickFk', (done: DoneFn) => {
      createHeroSidekickSelector$(3).subscribe(sk => {
        expect(sk).toBeUndefined();
        done();
      });
    });

    it('should get Gamma sidekick after creating and assigning one', (done: DoneFn) => {
      // Skip(1), the initial state in which Gamma has no sidekick
      // Note that BOTH dispatches complete synchronously, before the selector updates
      // so we only have to skip one.
      createHeroSidekickSelector$(3)
        .pipe(skip(1))
        .subscribe(sk => {
          expect(sk.name).toBe('Robin');
          done();
        });

      // create a new sidekick
      let action: EntityAction = eaFactory.create<Sidekick>(
        'Sidekick',
        EntityOp.ADD_ONE,
        {
          id: 42,
          name: 'Robin'
        }
      );
      store.dispatch(action);

      // assign new sidekick to Gamma
      action = eaFactory.create<Update<Hero>>('Hero', EntityOp.UPDATE_ONE, {
        id: 3,
        changes: { id: 3, sidekickFk: 42 }
      });
      store.dispatch(action);
    });
  });
});

// #region Test support

interface Hero {
  id: number;
  name: string;
  saying?: string;
  sidekickFk?: number;
}

interface HeroPowerMap {
  id: number;
  heroFk: number;
  powerFk: number;
}

interface Power {
  id: number;
  name: string;
}

interface Sidekick {
  id: number;
  name: string;
}

function initializeCache(
  eaFactory: EntityActionFactory,
  store: Store<EntityCache>
) {
  let action: EntityAction;

  action = eaFactory.create<Sidekick[]>('Sidekick', EntityOp.ADD_ALL, [
    { id: 1, name: 'Bob' },
    { id: 2, name: 'Sally' }
  ]);
  store.dispatch(action);

  action = eaFactory.create<Hero[]>('Hero', EntityOp.ADD_ALL, [
    { id: 1, name: 'Alpha', sidekickFk: 1 },
    { id: 2, name: 'Beta', sidekickFk: 2 },
    { id: 3, name: 'Gamma' } // no sidekick
  ]);
  store.dispatch(action);

  action = eaFactory.create<Power[]>('Power', EntityOp.ADD_ALL, [
    { id: 10, name: 'Speed' },
    { id: 20, name: 'Strength' },
    { id: 30, name: 'Invisibility' }
  ]);
  store.dispatch(action);

  action = eaFactory.create<HeroPowerMap[]>('HeroPowerMap', EntityOp.ADD_ALL, [
    { id: 99, heroFk: 1, powerFk: 10 },
    { id: 98, heroFk: 1, powerFk: 20 },
    { id: 97, heroFk: 1, powerFk: 30 },
    { id: 96, heroFk: 2, powerFk: 30 }
    // Gamma has no powers
  ]);
  store.dispatch(action);
}
// #endregion Test support
