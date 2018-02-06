# Introduction to ngrx-data

The _ngrx-data_ library makes it easier to write an Angular application that manages [entity](faq.md#entity) data with 
[ngrx](faq.md#ngrx) in a "reactive" style, following the [redux](faq.md#redux) pattern.

>See the [FAQ](faq.md) for definitions and discussion of terms in this overview.
>
>Return to the [overview](README.md) page for a list of documentation topics.

## Why use it?

Many applications have substantial "domain models" with 10s or 100s of entity types. 
Instances of these entity types are created, retrieved, updated, and deleted (CRUD).

If you've tried to manage your entity data with _ngrx_, you've discovered that you have to write a lot of code for each entity type. 
For each type, you've written _actions_, _action-creators_, _reducers_, _effects_, _dispatchers_, and _selectors_ as well as the HTTP GET, PUT, POST, and DELETE methods. 
This is a ton of repetitive code to write, maintain, and test.

This library is _one_ way to radically reduce the amount of "boilerplate" necessary to manage entities with _ngrx_.

## How it works

With `ngrx-data` you say _as little as possible_ about your entity model
and let the library do the work.  Let the library perform all the _ngrx_ operations. Let the library make the HTTP calls.
You focus on the application logic.


With the `ngrx-data` library you write a minimum of configuration to describe your entity model.
Then inject an _ngrx-data_ `EntityService` into your components. 

The `EntityService` offers a standard set of command methods for issuing HTTP requests and `Observable` _selectors_ that push entity data into your component for processing and display.

The `ngrx-data` library uses conventions to drive a standard set of behaviors that become dispatched _ngrx actions_, intercepted by _ngrx effects_, routed to a RESTy data service that makes the HTTP calls.

Server responses become new _ngrx actions_ that pass through _ngrx reducers_, where they update the _ngrx store_, triggering the store `Observables` that send values through _ngrx selectors_ to your application components. 

The mechanics are handled for you _inside the library_. You don't have to write any _ngrx_ code. Just follow the _ngrx-data usage_ pattern and get on with your life.

You can see the _ngrx machinery_ at work with the _redux developer tools_. You can listen to the flow of actions directly. You can intercept and override _anything_ ... but you only have to intervene where you need to add custom logic. 

### Show me

This repository comes with a demo app for editing _Heroes_ and _Villains_ in the `src/client/app/` folder.

>Instructions to install and run it are in the repository [README](../README.md#install-and-run).

Here's a _slightly reduced_ extract from that demo to illustrate the essential mechanics of configuring and using _ngrx-data_.

You begin with a description of the entity model in a few lines of metadata.

```javascript
/* app/store/entity-metadata.ts */

// Metadata for the entity model
export const entityMetadata: EntityMetadataMap = {
  Hero: {
    entityName: 'Hero',
    sortComparer: sortByName, // optional
    filterFn: nameFilter      // optional
  },
  
  Villain: {
    entityName: 'Villain',
    filterFn: nameAndSayingFilter // optional
  }
};

// Tell ngrx-data how to pluralize entity type names
export const pluralNames = {
  Hero: 'Heroes' // the plural of Hero
};
```

Now register the Web API configuration, metadata, and plurals with the `ngrx-data` module in the root `AppModule`.

```javascript
/* app/app.module.ts */

import { pluralNames, entityMetadata } from './entity-metadata';

// Set 'api', the root URL of the remote Web API.
const entityDataServiceConfig: EntityDataServiceConfig = { api: 'api'};

@NgModule({
  imports: [
    NgrxDataModule.forRoot({
      entityDataServiceConfig,
      entityMetadata: entityMetadata,
      pluralNames: pluralNames
    })
  ]
})
export class EntityStoreModule {}
```

The `HeroesComponent` creates an `EntityService` for _heroes_
and calls that service to read and save _Hero_ entity data in a reactive, immutable style, _without reference to any of the ngrx artifacts_.

```javascript
/* app/heroes/heroes/heroes.component.ts */

import { EntityService, EntityServiceFactory } from 'ngrx-data';
import { Hero } from '../../core';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroesComponent implements OnDestroy, OnInit {
  heroes$: Observable<Hero[]>;
  heroService: EntityService<Hero>;

  constructor(entityServiceFactory: EntityServiceFactory) {
    this.heroService = entityServiceFactory.create<Hero>('Hero');
    this.heroes$ = this.heroService.entities$;
  }

  ngOnInit() {
    this.getHeroes();
  }

  getHeroes() {
    this.heroService.getAll();
  }

  update(hero: Hero) {
    this.heroService.update(hero);
  }

  add(hero: Hero) {
    this.heroService.add(hero);
  }

  deleteHero(hero: Hero) {
    this.heroService.delete(hero.id);
  }
}
```
The component template displays the `heroes$` _observable_
by subscribing to it with the Angular `AsyncPipe`.

```html
<!-- app/heroes/heroes/heroes.component.html -->

<div *ngIf="heroes$ | async as heroes">
  ...
  <app-hero-list 
    [heroes]="heroes"
    (deleted)="deleteHero($event)">
  </app-hero-list>
  ...
</div>
```
