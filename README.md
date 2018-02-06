# Angular ngrx-data

## What is _ngrx-data_?

The
[`ngrx-data` library](https://github.com/johnpapa/angular-ngrx-data)
makes it easier to write an Angular application that manages
[entity](https://github.com/johnpapa/angular-ngrx-data/blob/master/docs/faq.md#entity)
data with
[ngrx](https://github.com/ngrx/platform/blob/master/README.md)
in a "reactive" style, following the
[redux](https://redux.js.org/) pattern.

## Why use it?

Many applications have substantial "domain models" with 10s or 100s of entity types.
Instances of these entity types are created, retrieved, updated, and deleted (CRUD).

If you've tried to manage your entity data with _ngrx_, you've discovered that you have to write a lot of code for each entity type. For each type, you've written _actions_, _action-creators_, _reducers_, _effects_, _dispatchers_, and _selectors_ as well as the HTTP GET, PUT, POST, and DELETE methods. This is a ton of code to write, maintain, and test.

There must be a way to tame the madness.
This library is _an answer_ ... or at least the beginning of an answer.

## How it works

The
["_Introduction to ngrx-data_"](https://github.com/johnpapa/angular-ngrx-data/blob/master/docs/introduction.md)
guide offers a quick overview.

The
["_Overview_"](https://github.com/johnpapa/angular-ngrx-data/blob/master/docs/README.md) page links to more in-depth documentation.

## Explore this repository

This repository contains the _ngrx-data_ source code and a
demonstration application that exercises many of the library features.

What you'll find in this repo's folders:

- docs --> contains the docs for the library and the demo
- lib ---> contains the ngrx-data library that we publish to npm
- src ---> contains the demo

The library tests in the `lib` folder reveal additional features and edge cases.

Clone this repository

   ```bash
   git clone https://github.com/johnpapa/angular-ngrx-data.git
   cd angular-ngrx-data
   ```

(1) Install the npm packages

   ```bash
   npm install
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

## Monitor the app with Redux DevTools

The demo app is
[configured for monitoring](https://github.com/ngrx/platform/tree/master/docs/store-devtools)
with the
[Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension).

Follow these instructions to
[install them in your browser](https://github.com/zalmoxisus/redux-devtools-extension)
and learn how to use them.

## Explore and run the library tests

The _ngrx-data_ library ships with unit tests.
These tests demonstrate features of the library just as the demo app does.

Run this CLI command to execute the tests.

```bash
ng test
```

We welcome PRs that add to the tests as well as those that fix code bugs and documentation.

Be sure to run these tests before submitting a PR for review.

## Build the app against the npm package

The demo app is setup to build and run against the version of the library in
`dist/ngrx-data`.
That's a convenient arrangement when you're evolving the library and
re-building as you go with `npm run build-lib` or `npm run build-setup`.
The version in `dist/ngrx-data` will reflect your latest changes;
obviously the package deployed in `node_modules` does not.

But you may want to see how the demo app runs against the published package. 

To do that, you'll have to make **a few temporary changes** to the TypeScript configuration.

1. **_Remove_** the following from `src/tsconfig.json` so that the IDE (e.g., VS Code)
looks for `ngrx-data` in `node_modules/ngrx-data` instead of `src/lib`.

```bash
  "paths": {
    "ngrx-data": ["../lib/src"]
  },
```

2. **_Remove_** _that same setting_ from the `src/client/tsconfig.app.json`.
The app now `ng build` references `node_modules/ngrx-data` instead of `src/lib`.


Now you can install the `ngrx-data` package _without touching the `package.json`_ by running:

```bash
npm install ngrx-data --no-save --no-lock
```

>**Remember to _restore the `tsconfig` settings_ when you're done. Do not commit those changes!**
## Publish to npm

Only a few of us are authorized to publish the npm package.
Here is our checklist.

1. Confirm that the library builds cleanly and that
the demo app can use it in production with `npm run build-all`

1. Run `ng tests`; all tests should pass.

1. Bump the npm package version number in `lib/package.json`. 

1. Run `npm run build-publish`. 
That command builds the library one more time before publishing to npm.

1. Commit the `lib/package.json` version change.

The publish step will fail if you aren't authorized to publish.

The publish step will fail if you forgot to bump the version in which case, bump the version, and try the publish step again. Remember to commit the version change.

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
