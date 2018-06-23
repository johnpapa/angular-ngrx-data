/*
 * In contrast with heroes.component.spec.ts, these tests mock the ngrx-data EntityEffects.
 *
 * If you don't have a HeroesService and want to talk to the store directly in your component,
 * you might consider this technique which intercepts the persist$ effect and mocks its behavior.
 *
 * This example is heavier than heroes.component.spec.ts,
 * in part because it digs into EntityEffects but mostly because it
 * inspects various implementation details such as the reducers and the dispatcher
 * which you probably wouldn't look at in real tests.
 *
 * This spec also demonstrates an alternative style that replaces BeforeEach() with
 * test setup function calls.
 *
 * You have a choice of testing the component class alone or the component-and-its-template.
 * The latter requires importing more stuff and a bit more setup.
 */

// region imports
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { Action, StoreModule, Store } from '@ngrx/store';
import { Actions, EffectsModule } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing'; // interesting but not used

import {
  EntityAction,
  EntityActionFactory,
  EntityCache,
  EntityOp,
  EntityActionOptions,
  EntityEffects,
  EntityCollectionReducer,
  EntityCollectionReducerRegistry,
  EntityCollectionService,
  persistOps
} from 'ngrx-data';

import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { first, skip } from 'rxjs/operators';

import { AppSelectors } from '../../store/app-config/selectors';
import { AppEntityServices } from '../../store/entity/app-entity-services';
import { EntityStoreModule } from '../../store/entity/entity-store.module';
import { NgrxDataToastService } from '../../store/entity/ngrx-data-toast.service';
import { Hero, CoreModule } from '../../core';
import { HeroesComponent } from './heroes.component';
import { HeroesService } from '../heroes.service';

// Used only to test class/template interaction
import { HeroListComponent } from '../hero-list/hero-list.component';
import { HeroDetailComponent } from '../hero-detail/hero-detail.component';

// endregion imports

describe('HeroesComponent (mock effects)', () => {
  describe('class-only', () => {
    it('can instantiate component', () => {
      heroesComponentClassSetup();
      const component: HeroesComponent = TestBed.get(HeroesComponent);
      expect(component).toBeDefined();
    });

    it('should initialize component with getAll() [no helper]', () => {
      const { createHeroAction, initialHeroes, setPersistResponses } = heroesComponentClassSetup();

      const getAllSuccessAction = createHeroAction(EntityOp.QUERY_ALL_SUCCESS, initialHeroes);

      let subscriptionCalled = false;

      const component: HeroesComponent = TestBed.get(HeroesComponent);
      component.ngOnInit();

      component.loading$.pipe(first()).subscribe(loading => expect(loading).toBe(true, 'loading while getting all'));

      setPersistResponses(getAllSuccessAction);

      component.filteredHeroes$.subscribe(heroes => {
        subscriptionCalled = true;
        expect(heroes.length).toBe(initialHeroes.length);
      });

      component.loading$.pipe(first()).subscribe(loading => expect(loading).toBe(false, 'loading after getting all'));

      expect(subscriptionCalled).toBe(true, 'should have gotten heroes');
    });

    it('should initialize component with getAll() [using helper]', () => {
      const { component, initialHeroes } = getInitializedComponentClass();

      let subscriptionCalled = false;

      component.filteredHeroes$.subscribe(heroes => {
        subscriptionCalled = true;
        expect(heroes.length).toBe(initialHeroes.length);
      });

      expect(subscriptionCalled).toBe(true, 'should have gotten heroes');
    });

    it('should filter heroes when filter value changes', () => {
      const { component, createHeroAction } = getInitializedComponentClass();

      let subscriptionCalled = false;

      // The data-bound FilterComponent would call the observer like this
      component.filterObserver.setFilter('a'); // case insensitive

      component.filteredHeroes$.subscribe(heroes => {
        subscriptionCalled = true;
        expect(heroes.length).toBe(1);
        expect(heroes[0].name).toBe('A');
      });

      expect(subscriptionCalled).toBe(true, 'subscription was called');
    });

    it('should delete a hero', () => {
      const {
        component,
        createHeroAction,
        dispatchSpy,
        heroReducerSpy,
        initialHeroes,
        setPersistResponses
      } = getInitializedComponentClass();

      let subscriptionCalled = false;

      component.delete(initialHeroes[1]); // 'B'

      const success = createHeroAction(EntityOp.SAVE_DELETE_ONE);

      setPersistResponses(success);

      // Optimistic so works even before the effect actions completes
      component.filteredHeroes$.subscribe(heroes => {
        subscriptionCalled = true;
        expect(heroes.length).toBe(initialHeroes.length - 1);
      });

      expect(subscriptionCalled).toBe(true, 'subscription was called');
      expect(dispatchSpy.calls.count()).toBe(1, 'can only see the direct dispatch to the store!');
      expect(heroReducerSpy.calls.count()).toBe(2, 'HroReducer called twice');
    });

    it('should add a hero', () => {
      const { component, createHeroAction, initialHeroes, setPersistResponses } = getInitializedComponentClass();

      let subscriptionCalled = false;

      const testHero: Hero = {
        id: undefined,
        name: 'Test',
        saying: 'Say test'
      };

      component.add(testHero);

      const success = createHeroAction(EntityOp.SAVE_ADD_ONE_SUCCESS, {
        ...testHero,
        id: 42
      });

      setPersistResponses(success);

      component.filteredHeroes$.subscribe(heroes => {
        subscriptionCalled = true;
        expect(heroes.length).toBe(initialHeroes.length + 1);
      });

      expect(subscriptionCalled).toBe(true, 'subscription was called');
    });
  });

  describe('class+template', () => {
    beforeEach(heroesComponentDeclarationsSetup);

    it('should display all heroes', () => {
      const { component, fixture, initialHeroes, view } = getInitializedComponent();
      const itemEls = view.querySelectorAll('ul.heroes li');
      expect(itemEls.length).toBe(initialHeroes.length);
    });
  });
});

// region Effects-mocking CLASS-ONLY test helpers

function heroesComponentClassSetup() {
  TestBed.configureTestingModule({
    imports: [StoreModule.forRoot({}), EffectsModule.forRoot([]), CoreModule, EntityStoreModule],
    providers: [
      Actions,
      AppEntityServices,
      AppSelectors,
      HeroesComponent, // When testing class-only
      HeroesService,
      { provide: HttpClient, useValue: null },
      { provide: NgrxDataToastService, useValue: null }
    ]
  });

  // Component listens for toggle between local and remote DB
  const appSelectorsDataSource = new BehaviorSubject('local');
  const appSelectors: AppSelectors = TestBed.get(AppSelectors);
  spyOn(appSelectors, 'dataSource$').and.returnValue(appSelectorsDataSource);

  // Create Hero entity actions as ngrx-data will do it
  const entityActionFactory: EntityActionFactory = TestBed.get(EntityActionFactory);
  function createHeroAction(op: EntityOp, data?: any, options?: EntityActionOptions) {
    return entityActionFactory.create('Hero', op, data, options);
  }

  // Spy on EntityEffects
  const effects: EntityEffects = TestBed.get(EntityEffects);
  let persistResponsesSubject: ReplaySubject<Action>;

  const persistSpy = spyOn(effects, 'persist').and.callFake(
    (action: EntityAction) => (persistResponsesSubject = new ReplaySubject<Action>(1))
  );

  // Control EntityAction responses from EntityEffects spy
  function setPersistResponses(...actions: Action[]) {
    actions.forEach(action => persistResponsesSubject.next(action));
    persistResponsesSubject.complete();
  }

  // Sample Hero test data
  const initialHeroes = [
    { id: 1, name: 'A', saying: 'A says' },
    { id: 3, name: 'B', saying: 'B says' },
    { id: 2, name: 'C', saying: 'C says' }
  ];

  // Spy on dispatches to the store (not very useful)
  const testStore: Store<EntityCache> = TestBed.get(Store);
  const dispatchSpy = spyOn(testStore, 'dispatch').and.callThrough();

  return {
    appSelectorsDataSource,
    createHeroAction,
    dispatchSpy,
    effects,
    entityActionFactory,
    initialHeroes,
    persistResponsesSubject,
    persistSpy,
    setPersistResponses,
    testStore
  };
}

/**
 * Create and initialize the component for CLASS-ONLY tests.
 * Initialization gets all Heroes.
 */
function getInitializedComponentClass() {
  const setup = heroesComponentClassSetup();
  const { createHeroAction, dispatchSpy, initialHeroes, setPersistResponses } = setup;

  const getAllSuccessAction = createHeroAction(EntityOp.QUERY_ALL_SUCCESS, initialHeroes);

  // When testing the class-only, can inject it as if it were a service
  const component: HeroesComponent = TestBed.get(HeroesComponent);
  component.ngOnInit();

  setPersistResponses(getAllSuccessAction);

  dispatchSpy.calls.reset(); // don't count the getAll actions

  const heroReducerSpy = spyOnHeroReducer();

  return { ...setup, component, heroReducerSpy };
}

function spyOnHeroReducer() {
  const registry: EntityCollectionReducerRegistry = TestBed.get(EntityCollectionReducerRegistry);
  const heroReducer: EntityCollectionReducer<Hero> = registry.getOrCreateReducer<Hero>('Hero');
  const heroReducerSpy = jasmine.createSpy('HeroReducer', heroReducer).and.callThrough();
  // re-register the spy version
  registry.registerReducer<Hero>('Hero', heroReducerSpy);
  return heroReducerSpy;
}

// endregion Effects-mocking CLASS-ONLY test helpers

// region Effects-mocking CLASS+TEMPLATE test helpers

// Call this when testing class/template interaction
// Not needed when testing class-only
function heroesComponentDeclarationsSetup() {
  TestBed.configureTestingModule({
    imports: [ReactiveFormsModule],
    declarations: [HeroesComponent, HeroListComponent, HeroDetailComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA] // ignore Angular Material elements
  });
}

/**
 * Create and initialize the component CLASS-AND-TEMPLATE tests.
 * Initialization gets all Heroes.
 */
function getInitializedComponent() {
  const setup = heroesComponentClassSetup();
  const { createHeroAction, initialHeroes, setPersistResponses } = setup;

  const fixture = TestBed.createComponent(HeroesComponent);
  const component = fixture.componentInstance;
  const view: HTMLElement = fixture.nativeElement;

  fixture.detectChanges(); // triggers ngOnInit() which gets all heroes.

  const getAllSuccessAction = createHeroAction(EntityOp.QUERY_ALL_SUCCESS, initialHeroes);
  setPersistResponses(getAllSuccessAction);

  fixture.detectChanges(); // populate view with heroes from store.

  return { ...setup, component, fixture, view };
}

// endregion Effects-mocking CLASS+TEMPLATE test helpers
