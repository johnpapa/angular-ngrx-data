# Angular ngrx-data

## What is _ngrx-data_?

The `ngrx-data` library makes it easier to write an Angular application that manages [entity](docs/faq.md#entity) data with 
[ngrx](docs/faq.md#ngrx) in a "reactive" style, following the [redux](docs/faq.md#redux) pattern.

>See the [FAQ](docs/faq.md) for definitions and discussion of terms in this overview.

## Why use it?

Many applications have substantial "domain models" with 10s or 100s of entity types. 
Instances of these entity types are created, retrieved, updated, and deleted (CRUD).

If you've tried to manage your entity data with _ngrx_, you've discovered that you have to write a lot of code for each entity type. For each type, you've written _actions_, _action-creators_, _reducers_, _effects_, _dispatchers_, and _selectors_ as well as the HTTP GET, PUT, POST, and DELETE methods. This is a ton of code to write, maintain, and test.

There must be a way to tame the madness.
This library is _an answer_ ... or at least the beginning of an answer.

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

You can see the _ngrx machinery_ at work with the _redux developer tools_. You can listen to the flow of actions directly. You can intercept and override _anything_ ... but you only have to intervene where you need to custom logic. 

### Show me

This repository comes with a demo app for editing _Heroes_ and _Villains_ in the `src/client/app/` folder.

>Instructions to run it [below](#run-the-app).

Here's a _slightly reduced_ extract from that demo to illustrate what we mean beginning with a description of the entity model in a few lines of metadata.

```javascript
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

export const pluralNames = {
  Hero: 'Heroes' // the plural of Hero
};
```

Now register the metadata and plurals with the `ngrx-data` module.

```javascript
import { pluralNames, entityMetadata } from './entity-metadata';

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
import { EntityService, EntityServiceFactory } from 'ngrx-data';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroesComponent implements OnDestroy, OnInit {
  addingHero = false;
  heroes$: Observable<Hero[]>;
  heroService: EntityService<Hero>;
  selectedHero: Hero;

  constructor(entityServiceFactory: EntityServiceFactory) {
    this.heroService = entityServiceFactory.create<Hero>('Hero');
    this.heroes$ = this.heroService.entities$;
  }

  ngOnInit() {
    this.getHeroes();
  }

  getHeroes() {
    this.heroService.getAll();
    this.unselect();
  }

  update(hero: Hero) {
    this.heroService.update(hero);
  }

  add(hero: Hero) {
    this.heroService.add(hero);
  }

  deleteHero(hero: Hero) {
    this.unselect();
    this.heroService.delete(hero.id);
  }

  onSelect(hero: Hero) {
    this.addingHero = false;
    this.selectedHero = hero;
  }

  unselect() {
    this.addingHero = false;
    this.selectedHero = null;
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }
}
```
The component template displays the `heroes$` _observable_
by subscribing to them with the Angular `AsyncPipe`.

```html
<div *ngIf="filteredHeroes$ | async as heroes">
  ...
  <app-hero-list 
    [heroes]="heroes" 
    [selectedHero]="selectedHero" 
    (deleted)="deleteHero($event)" 
    (selected)="onSelect($event)">
  </app-hero-list>
  ...
</div>
```

## Explore this repository

Clone this repository

   ```bash
   git clone https://github.com/johnpapa/angular-ngrx-data.git
   cd angular-ngrx-data
   ```

(1) Install the npm packages

   ```bash
   npm i
   ```

(2) Build the `ngrx-data` library

   ```bash
   npm run build-setup
   ```

(3) Serve the CLI-based demo app

   ```bash
   ng serve
   ```

(4) Open a browser to `localhost:4200`

>TODO: Disable the remote server feature. Explain how to re-enable it. Maybe figure out how to do that automatically

## Watch it work with redux tools

>TBD: Describe how to install the redux tools in the (Chrome-only?) browser, open the dev tools,
navigate to the redux tool, and goof around there.

## Explore and run the library tests

The _ngrx-data_ library ships with unit tests.
These tests demonstrate features of the library just as the demo app does.

Run this CLI command to execute the tests.

```bash
ng test
```

We welcome PRs that add to the tests as well as those that fix code bugs and documentation.

Be sure to run these tests before submitting a PR for review.

## How to build a new _ngrx-data_ app

>TODO: how to implement this in a new Angular CLI app

### Requirements

1. Install the Angular CLI

   ```bash
   npm install -g @angular/cli
   ```

1. Create a
   [CosmosDB instance](https://docs.microsoft.com/en-us/azure/cosmos-db/tutorial-develop-mongodb-nodejs-part4)
### Running the app

1. Build the Angular app and launch the node server

   ```bash
   npm run build
   npm run dev
   ```

1. Open the browser to <http://localhost:3001>

### Docker

* Install and run [Docker](https://www.docker.com/community-edition)

#### Environment file

Create an empty file named `.env` in the root of the app. We'll fill this in later.

#### Docker Compose with Debugging

Create the Docker image and run it locally. This commands uses `docker-compose` to build the image
and run the container.

This opens port `9229` for debugging.

```bash
npm run docker-debug
open http://localhost:3001
```

Open VS Code, launch the `Docker: Attach to Node` debugging profile

### Optional Database

```bash
NODE_ENV=development

PORT=3001
PUBLICWEB=./publicweb

COSMOSDB_ACCOUNT=your_cosmos_account
COSMOSDB_DB=your_cosmos_db
COSMOSDB_KEY=your_cosmos_key
COSMOSDB_PORT=10255
```

Out of the box you can run the demo with an in memory data service instead of a live database. If
you wish to use a database, you can set up a local mongo server or a remote CosmosDB/MongoDB server
in the cloud.

1. Configure Cosmos DB server settings

   Copy the contents from `.env.example` into `.env`. Replace the values with your specific
   configuration. Don't worry, this file is in the `.gitignore` so it won't get pushed to github.

   ```javascript
   NODE_ENV=development

   PORT=3001
   PUBLICWEB=./publicweb

   COSMOSDB_ACCOUNT=your_cosmos_account
   COSMOSDB_DB=your_cosmos_db
   COSMOSDB_KEY=your_cosmos_key
   COSMOSDB_PORT=10255
   ```

## Problems or Suggestions

[Open an issue here](https://github.com/johnpapa/angular-ngrx-data/issues)
