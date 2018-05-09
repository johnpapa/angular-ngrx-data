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

If you've tried to manage your entity data with _ngrx_, you've discovered that you have to write a lot of code for each entity type.
For each type, you've written _actions_, _action-creators_, _reducers_, _effects_, _dispatchers_, and _selectors_ as well as the HTTP GET, PUT, POST, and DELETE methods.
This is a ton of repetitive code to write, maintain, and test.

This library is _one_ way to radically reduce the amount of "boilerplate" necessary to manage entities with _ngrx_.

## How it works

See the [repository README](https://github.com/johnpapa/angular-ngrx-data/blob/master/docs/README.md).

## Problems or Suggestions

[Open an issue here](https://github.com/johnpapa/angular-ngrx-data/issues)
