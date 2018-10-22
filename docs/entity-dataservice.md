# Entity DataService

The _ngrx-data_ library expects to persist entity data with calls to a REST-like web api with endpoints for each entity type.

The [`EntityDataService`](../lib/src/dataservices/entity-data.service.ts) maintains a registry of service classes dedicated to persisting data for a specific entity type.

When the _ngrx-data_ library sees an action for an entity _persistence operation_, it asks the `EntityDataService` for the registered data service that makes HTTP calls for that entity type, and calls the appropriate service method.

A data service is an instance of a class that implements the
[`EntityCollectionDataService<T>` interface](../lib/src/dataservices/entity-data.service.ts).
This interface supports a basic set of CRUD operations that return `Observables`:

| Method                                                   | Meaning                               |
| -------------------------------------------------------- | ------------------------------------- |
| `add(entity: T)`                                         | Add a new entity                      |
| `delete(id: any)`                                        | Delete an entity by primary key value |
| `getAll()`                                               | Get all instances of this entity type |
| `getById(id: any)`                                       | Get an entity by its primary key      |
| `getWithQuery(queryParams: QueryParams` &#x7c; `string)` | Get entities that satisfy the query   |
| `update(update: Update<T>)`                              | Update an existing entity             |

> `QueryParams` is a _parameter-name/value_ map
> You can also supply the query string itself.
> `HttpClient` safely encodes both into an encoded query string.
>
> `Update<T>` is an object with a strict subset of the entity properties.
> It _must_ include the properties that participate in the primary key (e.g., `id`).
> The update property values are the _properties-to-update_;
> unmentioned properties should retain their current values.

The default data service methods return the `Observables` returned by the corresponding Angular `HttpClient` methods.

> If you create your own data service alternatives, they should return similar `Observables`.

## Register data services

The `EntityDataService` registry is empty by default.

You can add custom data services to it by creating instances of those classes and registering them with `EntityDataService` in one of two ways.

1.  register a single data service by entity name with the `registerService()` method.

1.  register several data services at the same time with by calling `registerServices` with an _entity-name/service_ map.

> You can create and import a module that registers your custom data services as show in the [EntityDataService tests](../lib/src/dataservices/entity-data.service.spec.ts)

If you decide to register an entity data service, be sure to do so _before_ you ask _ngrx-data_ to perform a persistence operation for that entity.

Otherwise, the _ngrx-data_ library will create and register an instance of the default data service `DefaultDataService<T>` for that entity type.

## The _DefaultDataService_

The demo app doesn't register any entity data services. It relies entirely on a [`DefaultDataService<T>`](../lib/src/dataservices/default-data.service.ts), created for the entity type by the injected `DefaultDataServiceFactory`.

A `DefaultDataService<T>` makes REST-like calls to the server's web api with Angular's `HttpClient`.

It composes HTTP URLs from a _root_ path (see ["Configuration"](#configuration) below) and the entity name.

For example,

* if the persistence action is to delete a hero with id=42 _and_
* the root path is `'api'` _and_
* the entity name is `'Hero'`, _then_
* the DELETE request URL will be `'api/hero/42'`.

When the persistence operation concerns multiple entities, the `DefaultDataService` substitutes the plural of the entity type name for the resource name.

The `QUERY_ALL` action to get all heroes would result in an HTTP GET request to the URL `'api/heroes'`.

The `DefaultDataService` doesn't know how to pluralize the entity type name.
It doesn't even know how to create the base resource names.
It relies on an injected
[`HttpUrlGenerator` service](../lib/src/dataservices/http-url-generator.ts) those.
And the default implementation of that generator relies on the
[`Pluralizer`](../lib/src/utils/default-pluralizer.ts) service to
get the collection resource name.
The [_Entity Metadata_](entity-metadata.md#plurals) guide
explains how to configure the default `Pluralizer` .

<a id="configuration"></a>

### Configure the _DefaultDataService_

The collection-level data services construct their own URLs for HTTP calls. They typically rely on shared configuration information such as the root of every resource URL.

The shared configuration values are almost always specific to the application and may vary according the runtime environment.

The _ngrx-data_ library defines a [`DefaultDataServiceConfig` class](../lib/src/dataservices/default-data.service.ts) for conveying shared configuration to an entity collection data service.

The most important configuration property, `root`, returns the _root_ of every web api URL, the parts that come before the entity resource name.

For a `DefaultDataService<T>`, the default value is `'api'`, which results in URLs such as `api/heroes`.

The `timeout` property sets the maximum time (in ms) before the _ng-lib_ persistence operation abandons hope of receiving a server reply and cancels the operation. The default value is `0`, which means that requests do not timeout.

The `delete404OK` flag tells the data service what to do if the server responds to a DELETE request with a `404 - Not Found`.

In general, not finding the resource to delete is harmless and
you can save yourself the headache of ignoring a DELETE 404 error
by setting this flag to `true`, which is the default for the `DefaultDataService<T>`.

When running a demo app locally, the server may respond more quickly than it will in production. You can simulate real-world by setting the `getDelay` and `saveDelay` properties.

#### Provide a custom configuration

First, create a custom configuration object of type `DefaultDataServiceConfig` :

```
const defaultDataServiceConfig: DefaultDataServiceConfig = {
  root: 'api',
  timeout: 3000, // request timeout
}
```

Provide it in an eagerly-loaded `NgModule` such as the `EntityStoreModule` in the sample application:

```
@NgModule({
  providers: [{ provide: DefaultDataServiceConfig, useValue: defaultDataServiceConfig }]
})
```

## Custom _EntityDataService_

While the _ngrx-data_ library provides a configuration object to modify certain aspects of the _DefaultDataService_,
you may want to further customize what happens when you save or retrieve data for a particular collection.

For example, you may need to modify fetched entities to convert strings to dates, or to add additional properties to an entity.

You could do this by creating a custom data service and registering that service with the `EntityDataService`.

To illustrate this, the sample app adds a `dateLoaded` property to the `Hero` entity to record when a hero is loaded from the server into the _ngrx-store_ entity cache.

> This could be useful if you replace stale heroes periodically.

```typescript
export class Hero {
  readonly id: number;
  readonly name: string;
  readonly saying: string;
  readonly dateLoaded: Date;
}
```

To support this feature, we 'll create a `HeroDataService` class that implements the `EntityCollectionDataService<T>` interface.

In the sample app the `HeroDataService` derives from the _ngrx-data_ `DefaultDataService<T>` in order to leverage its base functionality.
It only overrides what it really needs.

```typescript
// store/entity/hero-data-service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  EntityCollectionDataService,
  DefaultDataService,
  HttpUrlGenerator,
  Logger,
  QueryParams
} from 'ngrx-data';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Hero } from '../../core';

@Injectable()
export class HeroDataService extends DefaultDataService<Hero> {
  constructor(http: HttpClient, httpUrlGenerator: HttpUrlGenerator, logger: Logger) {
    super('Hero', http, httpUrlGenerator);
    logger.log('Created custom Hero EntityDataService');
  }

  getAll(): Observable<Hero[]> {
    return super.getAll().pipe(map(heroes => heroes.map(hero => this.mapHero(hero))));
  }

  getById(id: string | number): Observable<Hero> {
    return super.getById(id).pipe(map(hero => this.mapHero(hero)));
  }

  getWithQuery(params: string | QueryParams): Observable<Hero[]> {
    return super.getWithQuery(params).pipe(map(heroes => heroes.map(hero => this.mapHero(hero))));
  }

  private mapHero(hero: Hero): Hero {
    return { ...hero, dateLoaded: new Date() };
  }
}
```

This `HeroDataService` hooks into the _get_ operations to set the `Hero.dateLoaded` on fetched hero entities.
It also tells the logger when it is created (see the console output of the running sample) .

> Alternatively, you might write your own complete implementation of `DefaultDataService<T>`.
> It depends on the needs of your application.

Finally, we must tell _ngrx-data_ about this new data service.

The sample app provides `HeroDataService` and registers it by calling the `registerService()` method on the `EntityDataService` in the app's _entity store module_:

```typescript
// /store/entity-store.module.ts (excerpt)
...

import {
  ...  
  EntityDataService, // <-- import the ngrx-data data service registry
} from 'ngrx-data';

...

import { HeroDataService } from './hero-data-service';

@NgModule({
  imports: [ ... ],
  providers: [
    ...
    HeroDataService, // <-- provide the custom data service
  ]
})
export class EntityStoreModule {
  constructor(
    entityDataService: EntityDataService,
    heroDataService: HeroDataService,
    ...
  ) {
    // Register custom EntityDataServices
    entityDataService.registerService('Hero', heroDataService); // <-- register it
  }
}
```
