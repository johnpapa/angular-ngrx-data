# Angular ngrx-data

[![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)

## Zero Ngrx Boilerplate

**You may never write an action, reducer, selector, effect, or HTTP dataservice again.**

[_NgRx_](https://github.com/ngrx/platform/blob/master/README.md) helps Angular applications manage shared state in a "reactive" style, following the [redux](https://redux.js.org) pattern.

But to use it properly requires _both_ a deep understanding of redux/ngrx _and_ a lot of _boilerplate code_.

_Ngrx-data_ is an _ngrx_ extension that offers a gentle introduction to _ngrx/redux_ without the boilerplate.

> **Try it!** See the [Quick Start](https://github.com/johnpapa/ngrx-data-lab/blob/master/README.md) for instructions on adding NgRx and ngrx-data to your app.

<a id="why"></a>

## Why use _ngrx-data_?

Many applications have substantial _domain models_ with 10s or 100s of [entity types](docs/faq.md/#entity)
such as _Customer_, _Order_, _LineItem_, _Product_, and _User_.

In plain _ngrx_, to create, retrieve, update, and delete (CRUD) data for every entity type is an overwhelming task. You're writing _actions_, _action-creators_, _reducers_, _effects_, _dispatchers_, and _selectors_ as well as the HTTP GET, PUT, POST, and DELETE methods _for each entity type_.

In even a small model, this is a ton of repetitive code to create, maintain, and test.

The _ngrx-data_ library is _one_ way to stay on the _ngrx_ path while radically reducing the "boilerplate" necessary to manage entities with _ngrx_.

## It's still _NgRx_

**This is a _library for ngrx_, not an ngrx alternative.**

It's easy to combine standard ngrx with ngrx-data.
It's easy to take control when you need it and hand control back to ngrx-data when you're done.

Every entity has its own actions. Every operation takes its unique journey through the store, reducers, effects, and selectors. You just let _ngrx-data_ create these for you.

You can add custom store properties, actions, reducers, selectors, and effects. You can override any ngrx-data behavior for an individual entity type or for all entities.
You can make your own calls to the server and update the cached entity collections with the results using ngrx-data _cache-only_ actions.

You can see the _ngrx machinery_ at work with the [_redux developer tools_](#redux-dev-tools). You can listen to the flow of actions directly. You can _intercept and override anything_ ... but you only have to intervene where you want to add custom logic.

### Show me

For a hands-on experience, try the [QuickStart](https://github.com/johnpapa/ngrx-data-lab/blob/master/README.md)).
In this section, we summarize the key points.

The _ngrx-data_ repository includes a demo app for editing _Heroes_ and _Villains_ in the `src/client/app/` folder.
The following _reduced_ extract from that demo illustrates the essential mechanics of configuring and using _ngrx-data_.

You begin with a description of the entity model in a few lines of metadata.

```javascript
// Metadata for the entity model
export const entityMetadata: EntityMetadataMap = {
  Hero: {},
  Villain: {}
};

// Help ngrx-data pluralize entity type names
// because the plural of "Hero" is not "Heros"
export const pluralNames = {
  Hero: 'Heroes' // the plural of Hero
};
```

You register the metadata and plurals with the `ngrx-data` module.

```javascript
@NgModule({
  imports: [
    NgrxDataModule.forRoot({
      entityMetadata: entityMetadata,
      pluralNames: pluralNames
    })
  ]
})
export class EntityStoreModule {}
```

Create a `HeroService` to talk to _ngrx-data_.

```javascript
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

The `HeroesComponent` injects the `HeroService` and calls it to read and save _Hero_ entity data
in a reactive, immutable style, _without reference to any of the ngrx artifacts_.

```javascript
import { HeroService } from './hero-service';
import { Hero } from '../../core';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroesComponent implements OnInit {
  heroes$: Observable<Hero[]>;

  constructor(private heroService: HeroService) {
    this.heroes$ = heroService.entities$;
  }

  ngOnInit() {
    this.getHeroes();
  }

  getHeroes() {
    this.heroService.getAll();
  }

  addHero(hero: Hero) {
    this.heroService.add(hero);
  }

  deleteHero(hero: Hero) {
    this.heroService.delete(hero.id);
  }

  updateHero(hero: Hero) {
    this.heroService.update(hero);
  }
}
```

## QuickStart

Try the [Quick Start](https://github.com/johnpapa/ngrx-data-lab/blob/master/README.md) to experience NgRx and ngrx-data in your app.

<a id="explore"></a>

## Explore this repository

This repository contains the _ngrx-data_ source code and a
demonstration application (the "demo app") that exercises many of the library features.

The key folders in this repository are:

* docs --> the docs for the library and the demo
* lib ---> the ngrx-data library source code that we publish to npm
* src/client ---> the demo app source
* src/server ---> a node server for remote data access

<a id="docs-list"></a>

### Learn more in the docs

* [Quick Start](https://github.com/johnpapa/ngrx-data-lab/blob/master/README.md)
* [Architecture](docs/architecture.md)
* [Entity Metadata](docs/entity-metadata.md)
* [Entity Collection](docs/entity-collection.md)
* [Entity Service](docs/entity-service.md)
* [Entity DataService](docs/entity-dataservice.md)
* [Entity Actions](docs/entity-actions.md)
* [Entity Reducer](docs/entity-reducer.md)
* [Entity Change Tracker](docs/entity-change-tracker.md)
* [Extension Points](docs/extension-points.md)
* [Limitations](docs/limitations.md)
* [FAQ: Frequently Asked Questions](docs/faq.md)

### Install and run

The demo app is based on the Angular CLI. You may want to install the CLI globally if you have not already done so.

```bash
npm install -g @angular/cli
```

Then follow these steps:

1.  Clone this repository

    ```bash
    git clone https://github.com/johnpapa/angular-ngrx-data.git
    cd angular-ngrx-data
    ```

2.  Install the npm packages

    ```bash
    npm install
    ```

3.  Build the `ngrx-data` library

    ```bash
    npm run build-setup
    ```

4.  Serve the CLI-based demo app

    ```bash
    ng serve -o
    ```

## Run the library tests

The _ngrx-data_ library ships with unit tests to validate functionality and guard against regressions.

These tests also demonstrate features of the library that are not covered in the demo app. They're worth reading to discover more advanced techniques.

Run this CLI command to execute the tests for the library.

```bash
ng test
```

We welcome [PRs](https://github.com/johnpapa/angular-ngrx-data/pulls) that add to the tests as well as those that fix bugs and documentation.

Be sure to run these tests before submitting a PR for review.

<a id="redux-dev-tools"></a>

## Monitor the app with Redux DevTools

The demo app is [configured for monitoring](https://github.com/ngrx/platform/tree/master/docs/store-devtools) with the [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension).

Follow these instructions to [install them in your browser](https://github.com/zalmoxisus/redux-devtools-extension) and learn how to use them.

## Debug the library in browser dev tools

When running _tests_, open the browser dev tools, go to the "Sources" tab, and look for the library files by name.

> In chrome, type [Command-P] and letters of the file name.

When _running the app_ (e.g., with `ng serve`), the browser dev tools give you TWO choices for a given TypeScript source file, both claiming to be from `.ts`.

The one you want for library and app files ends in `/lib/src/file-name.ts` and `/src/client/app/path/file-name.ts` respectively.

> Hope to solve the _two file_ problem.

## Build the app against the npm package

The demo app is setup to build and run against the version of the library in `dist/ngrx-data`.

That's convenient when you're evolving the library code and
re-building as you go with `npm run build-lib` or `npm run build-setup`.

The version in `dist/ngrx-data` will reflect your latest changes.
Obviously the package deployed in `node_modules` would not.

If you want to see how the demo app runs against the published package, you'll have to make **a few temporary changes** to the TypeScript configuration.

1.  **_Remove_** the following from root `tsconfig.json` so that the IDE (e.g., VS Code) looks for `ngrx-data` in `node_modules/ngrx-data` instead of `src/lib`.

    ```bash
      "paths": {
        "ngrx-data": ["lib/src"]
      },
    ```

2.  **_Remove_** _that same setting_ from the `src/` config at `src/tsconfig.json`.

3.  **_Remove_** _that same setting_ from the `src/client/tsconfig.app.json`.
    Now `ng build` references `node_modules/ngrx-data` instead of `src/lib` when it builds the demo app.

4.  Now install the `ngrx-data` package _without touching the `package.json`_ as follows:

    ```bash
    npm install ngrx-data --no-save --no-lock
    ```

> **Remember to _restore the `tsconfig` settings_ when you're done. Do not commit those changes!**

## Use a real database

The demo app queries and saves mock entity data to an in-memory database with the help of the
[Angular In-memory Web API](https://github.com/angular/in-memory-web-api).

The "Remote Data" toggle switch in the header switches
to the remote database.

The app fails when you switch to the remote database.

> Notice how the app detects errors and pops up a toast message with the failed _ngrx_ `Action.type`.
>
> The error details are in the browser's console log.

You must first set up a database and launch a web api server that talks to it.

The `src/server` folder has code for a local node web api server, configured for the demo app.

> TODO:
> Explain how to build and run the server.
> Explain how to build and serve the mongo db

## Bad/surplus _npm scripts_

We know there are a great many npm script commands in `package.json`, many (most?) of which don't work.

They're on our list for future cleanup.
Please don't create issues for them
(although PRs that fix them are welcome).

<!--

>TODO: Fix the broken server-oriented commands in package.json

### Create a MongoDb

1. Create a [CosmosDB instance](https://docs.microsoft.com/en-us/azure/cosmos-db/tutorial-develop-mongodb-nodejs-part4)

### Build and launch the node server

1. Build the Angular app and launch the node server

```bash
???
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

Out of the box you can run the demo with an in memory data service instead of a live database. If you wish to use a database, you can set up a local mongo server or a remote CosmosDB/MongoDB server in the cloud.

1. Configure Cosmos DB server settings

   Copy the contents from `.env.example` into `.env`. Replace the values with your specific configuration. Don't worry, this file is in the `.gitignore` so it won't get pushed to github.

   ```javascript
   NODE_ENV=development

   PORT=3001
   PUBLICWEB=./publicweb

   COSMOSDB_ACCOUNT=your_cosmos_account
   COSMOSDB_DB=your_cosmos_db
   COSMOSDB_KEY=your_cosmos_key
   COSMOSDB_PORT=10255
   ```
-->

## Problems or Suggestions

[Open an issue here](https://github.com/johnpapa/angular-ngrx-data/issues)
