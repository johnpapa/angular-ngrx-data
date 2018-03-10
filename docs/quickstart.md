# QuickStart

This quick start begins with a working angular app that has CRUD operations for heroes and villain entities. This app uses traditional services and techniques to get and save the heroes and villains. In this quick start you will add NgRx and ngrx-data to the app.

## Step 1 - get the sample app

```bash
git clone ngrx-data-lab toh
cd ngrx-data-lab
npm install
```

This sample app shows and allows editing of heroes and villains. The app uses a traditional data service to get the heroes and villains. Well be adding ngrx and ngrx-data to this application.

## Step 2 - Install libraries

Install NgRx, related libraries, and ngrx-data

```bash
npm i @ngrx/effects @ngrx/entity @ngrx/store @ngrx/store-devtools ngrx-data --save
```

## Step 3 - Create the NgRx App Store

We start by creating the NgRx store module for our application. Execute the following code to generate the module and import it into our root NgModule.

```bash
ng g m store/app-store --flat -m app
```

We must import the NgRx store, effects, and (for development only) the dev tools. To do this, replace the contents of `app-store.module.ts` with the following code.

```typescript
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../../environments/environment';

@NgModule({
  imports: [
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    environment.production ? [] : StoreDevtoolsModule.instrument()
  ]
})
export class AppStoreModule {}
```

## Step 4 - Create custom metadata for the entities

We need to tell ngrx-data about our entities. We create an `EntityMetadataMap` and any custom pluralization of our entities. EXecute the following command to create a `entity-metadata.ts` file in our `store` folder.

```bash
ng g cl store/entity-metadata
```

We create a constant of type `EntityMetadataMap` and define a set of properties, one for each entity name. We also define how to pluralize our entities, for those not simply needing an 's' appended to them (e.g. Hero --> Heroes).

> We have two entities: Hero and Villain. As you might imagine,we add one line of code for every additional entity. That's it!

Replace the contents of the file with the following code.

```typescript
import { EntityMetadataMap } from 'ngrx-data';

export const entityMetadata: EntityMetadataMap = {
  Hero: {},
  Villain: {}
};

export const pluralNames = {
  Hero: 'Heroes'
};
```

## Step 5 - Create the Entity store and define the entities

Next we create the entity store for ngrx-data and tell the Angular CLI to import it into our app-store module.

```bash
ng g m store/entity-store --flat -m store/app-store
```

We must import and configure ngrx-data into our entity store. We'll start by using all defaults, which is why the `DefaultDataServiceConfig` is an empty object literal. We'll pass the entity metadata that we previously creaed into ngrx-data.

Replace the code in the `entity-store.modules.ts` with the following code.

```typescript
import { NgModule } from '@angular/core';
import { DefaultDataServiceConfig, NgrxDataModule } from 'ngrx-data';
import { pluralNames, entityMetadata } from './entity-metadata';

const defaultDataServiceConfig: DefaultDataServiceConfig = {};

@NgModule({
  imports: [
    NgrxDataModule.forRoot({
      entityMetadata: entityMetadata,
      pluralNames: pluralNames
    })
  ],
  providers: [
    { provide: DefaultDataServiceConfig, useValue: defaultDataServiceConfig }
  ]
})
export class EntityStoreModule {}
```

## Step 6 - Simplify the Hero and Villain data services

Our application gets heroes and villains via Http from `hero.service.ts` and `villain.service.ts`, respectively. ngrx-data handles getting and saving our data (e.g. CRUD techniques) for us, if we ask it to.

Replace the contents of `heroes/hero.service.ts` with the following code.

```typescript
import { Injectable } from '@angular/core';
import { EntityServiceBase, EntityServiceFactory } from 'ngrx-data';

import { Hero } from '../core';

@Injectable()
export class HeroService extends EntityServiceBase<Hero> {
  constructor(entityServiceFactory: EntityServiceFactory) {
    super('Hero', entityServiceFactory);
  }
}
```

Replace the contents of `villains/villain.service.ts` with the following code.

```typescript
import { Injectable } from '@angular/core';
import { EntityServiceBase, EntityServiceFactory } from 'ngrx-data';

import { Villain } from '../core';

@Injectable()
export class VillainService extends EntityServiceBase<Villain> {
  constructor(entityServiceFactory: EntityServiceFactory) {
    super('Villain', entityServiceFactory);
  }
}
```

## Step 7 - Refactor the Heroes container component to use NgRx

Our heroes container component handles all interactions with the our hero data via `hero.service.ts`. We'll need to refactor the heroes container component to use ngrx and ngrx-data.

> The hero list and hero detail components are **presenter** components. They do not interact with the hero service nor will they interact with our store. The presenter components are given a hero or heroes to present, by a container component. The presenter components communicate to the container component when a hero should be saved, and the container component takes it from there.

We'll refactor our container components to use RxJs Observables and interact with the ngrx store.

Replace the contents of `heroes.component.ts` with the following code.

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Hero } from '../../core';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroesComponent implements OnInit {
  addingHero = false;
  selectedHero: Hero;

  heroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;

  constructor(public heroesService: HeroService) {
    this.heroes$ = this.heroesService.entities$;
    this.loading$ = this.heroesService.loading$;
  }

  ngOnInit() {
    this.getHeroes();
  }

  clear() {
    this.addingHero = false;
    this.selectedHero = null;
  }

  deleteHero(hero: Hero) {
    this.unselect();
    this.heroesService.delete(hero.id);
  }

  enableAddMode() {
    this.addingHero = true;
    this.selectedHero = null;
  }

  getHeroes() {
    this.heroesService.getAll();
    this.unselect();
  }

  onSelect(hero: Hero) {
    this.addingHero = false;
    this.selectedHero = hero;
  }

  update(hero: Hero) {
    this.heroesService.update(hero);
  }

  add(hero: Hero) {
    this.heroesService.add(hero);
  }

  unselect() {
    this.addingHero = false;
    this.selectedHero = null;
  }
}
```

Now let's update the HTML template to use the `heroes$` and `loading$` observables with the async pipe.

Locate the `*ngIf="heroes"` in the template and refactor it to use the observable and the async pipe, as shown below

```html
  <div *ngIf="heroes$ | async as heroes">
```

Locate the `*ngIf="loading"` in the template and refactor it to use the observable and the async pipe, as shown below

```html
  <mat-spinner *ngIf="loading$ | async;else heroList" mode="indeterminate" color="accent"></mat-spinner>
```

## Step 8 - Now refactor the Villains container component to use NgRx

Replace the contents of `villains.component.ts` with the following code.

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { Villain } from '../../core';
import { VillainService } from '../villain.service';

@Component({
  selector: 'app-villains',
  templateUrl: './villains.component.html',
  styleUrls: ['./villains.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VillainsComponent implements OnInit {
  addingVillain = false;
  selectedVillain: Villain;

  villains$: Observable<Villain[]>;
  loading$: Observable<boolean>;

  constructor(public villainsService: VillainService) {
    this.villains$ = this.villainsService.entities$;
    this.loading$ = this.villainsService.loading$;
  }

  ngOnInit() {
    this.getVillains();
  }

  clear() {
    this.addingVillain = false;
    this.selectedVillain = null;
  }

  deleteVillain(villain: Villain) {
    this.unselect();
    this.villainsService.delete(villain.id);
  }

  enableAddMode() {
    this.addingVillain = true;
    this.selectedVillain = null;
  }

  getVillains() {
    this.villainsService.getAll();
    this.unselect();
  }

  onSelect(villain: Villain) {
    this.addingVillain = false;
    this.selectedVillain = villain;
  }

  update(villain: Villain) {
    this.villainsService.update(villain);
  }

  add(villain: Villain) {
    this.villainsService.add(villain);
  }

  unselect() {
    this.addingVillain = false;
    this.selectedVillain = null;
  }
}
```

Now let's update the HTML template to use the `villains$` and `loading$` observables with the async pipe.

Locate the `*ngIf="villains"` in the template and refactor it to use the observable and the async pipe, as shown below

```html
  <div *ngIf="heroes$ | async as villains">
```

Locate the `*ngIf="loading"` in the template and refactor it to use the observable and the async pipe, as shown below

```html
  <mat-spinner *ngIf="loading$ | async;else villainList" mode="indeterminate" color="accent"></mat-spinner>
```

## Step 9 - Run it

Run the app!

```bash
ng serve -o
```
