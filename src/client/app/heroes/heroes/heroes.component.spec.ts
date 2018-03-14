/*
 * Test the component by mocking its injected ngrx-data HeroesService
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

import {
  EntityAction, EntityActionFactory, EntityCache, EntityOp,
  EntityEffects,
  EntityCollectionReducer,
  EntityReducerFactory,
  EntityService,
  persistOps,
} from 'ngrx-data';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { first, skip } from 'rxjs/operators';

import { AppSelectors } from '../../store/app-config/selectors';
import { EntityStoreModule } from '../../store/entity-store.module';
import { NgrxDataToastService } from '../../store/ngrx-data-toast.service';
import { Hero } from '../../core';
import { HeroesComponent } from './heroes.component';
import { HeroesService } from '../heroes.service';

// Used only to test class/template interaction
import { FilterComponent } from '../../shared/filter/filter.component';
import { HeroListComponent } from '../hero-list/hero-list.component';
import { HeroDetailComponent } from '../hero-detail/hero-detail.component';

// endregion imports

describe('HeroesComponent (mock HeroesService)', () => {
  let appSelectorsDataSource: BehaviorSubject<string>;
  let component: HeroesComponent;
  let heroesService: HeroesService;
  let testStore: Store<EntityCache>;

  let entityActionFactory: EntityActionFactory
  /** Create Hero entity actions as ngrx-data will do it */
  function createHeroAction(op: EntityOp, payload?: any) {
    return entityActionFactory.create('Hero', op, payload);
  }

  const initialHeroes = [
    {id: 1, name: 'A', saying: 'A says'},
    {id: 3, name: 'B', saying: 'B says'},
    {id: 2, name: 'C', saying: 'C says'},
  ];

  describe('class-only', () => {

    beforeEach(heroesComponentCoreSetup);

    beforeEach(() => {
      component = TestBed.get(HeroesComponent);
      component.ngOnInit(); // triggers getAll heroes
    });

    it('should initialize component with getAll()', () => {
      let subscriptionCalled = false;

      component.filteredHeroes$.subscribe(heroes => {
        subscriptionCalled = true;
        expect(heroes.length).toBe(initialHeroes.length);
      });

      component.loading$.pipe(first()).subscribe(loading => expect(loading).toBe(false, 'loading after'));

      expect(subscriptionCalled).toBe(true, 'should have gotten heroes');
    });

    it('should filter heroes when filter value changes', () => {
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
      let subscriptionCalled = false;

      spyOn(heroesService, 'add').and.callFake(() => {
        const success = createHeroAction(EntityOp.SAVE_DELETE_ONE_OPTIMISTIC_SUCCESS);
        testStore.dispatch(success);
      });

      component.delete(initialHeroes[1]); // 'B'

      component.filteredHeroes$.subscribe(heroes => {
        subscriptionCalled = true;
        expect(heroes.length).toBe(initialHeroes.length - 1);
      });

      expect(subscriptionCalled).toBe(true, 'subscription was called');
    });

    it('should add a hero', () => {
      let subscriptionCalled = false;

      const testHero: Hero = {id: undefined, name: 'Test', saying: 'Say test'}

      spyOn(heroesService, 'add').and.callFake(() => {
        const success = createHeroAction(EntityOp.SAVE_ADD_ONE_SUCCESS, { ...testHero, id: 42 });
        testStore.dispatch(success);
      });

      component.add(testHero)

      component.filteredHeroes$.subscribe(heroes => {
        subscriptionCalled = true;
        expect(heroes.length).toBe(initialHeroes.length + 1);
      });

      expect(subscriptionCalled).toBe(true, 'subscription was called');
    });
  });

  describe('class+template', () => {

    let fixture: ComponentFixture<HeroesComponent>;
    let view: HTMLElement;

    beforeEach(heroesComponentDeclarationsSetup);
    beforeEach(heroesComponentCoreSetup);

    beforeEach(() => {
      fixture = TestBed.createComponent(HeroesComponent);
      component = fixture.componentInstance;
      view = fixture.nativeElement;

      fixture.detectChanges(); // triggers ngOnInit() which gets all heroes.
      fixture.detectChanges(); // populate view with heroes from store.
    });

    it('should display all heroes', () => {
      const itemEls = view.querySelectorAll('ul.heroes li');
      expect(itemEls.length).toBe(initialHeroes.length);
    });

  });

  // region helpers
  function heroesComponentCoreSetup() {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        EntityStoreModule
      ],
      providers: [
        AppSelectors,
        HeroesComponent, // When testing class-only
        HeroesService,
        { provide: HttpClient, useValue: null },
        { provide: NgrxDataToastService, useValue: null}
      ]
    });

    // Component listens for toggle between local and remote DB
    appSelectorsDataSource = new BehaviorSubject('local');
    const appSelectors: AppSelectors = TestBed.get(AppSelectors);
    spyOn(appSelectors, 'dataSource$').and.returnValue(appSelectorsDataSource);

    entityActionFactory = TestBed.get(EntityActionFactory);

    heroesService = TestBed.get(HeroesService);
    spyOn(heroesService, 'getAll').and.callFake(() => {
      const getAllSuccessAction = createHeroAction(EntityOp.QUERY_ALL_SUCCESS, initialHeroes);
      testStore.dispatch(getAllSuccessAction);
    });

    testStore = TestBed.get(Store);
  }

  // Call this when testing class/template interaction
  // Not needed when testing class-only
  function heroesComponentDeclarationsSetup() {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule
      ],
      declarations: [
        FilterComponent,
        HeroesComponent,
        HeroListComponent, HeroDetailComponent,
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ] // ignore Angular Material elements
    });
  }

  // endregion helpers
});
