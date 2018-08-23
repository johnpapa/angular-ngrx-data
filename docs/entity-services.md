# EntityServices

`EntityServices` is a facade over the _ngrx-data_ services and the _ngrx-data_ `EntityCache`.

## Registry of _EntityCollectionServices_

It is primarily a registry of [EntityCollectionServices](entity-collection-service.md).

Call its `EntityServices.getEntityCollectionService(entityName)` method to get the singleton
`EntityCollectionService` for that entity type.

Here's a component doing that.

```javascript
import { EntityCollectionService, EntityServices } from 'ngrx-data';
import { Hero } from '../../model';

@Component({...})
export class HeroesComponent implements OnInit {
  heroesService: EntityCollectionService<Hero>;

  constructor(entityServices: EntityServices) {
    this.heroesService = entityServices.getEntityCollectionService('Hero');
  }
```

If the `EntityCollectionService` service does not yet exist,
`EntityServices` creates a default instance of that service and registers
that instance for future reference.

## Create a custom _EntityCollectionService_

You'll often create custom `EntityCollectionService` classes with additional capabilities and convenience members,
as explained in the [EntityCollectionService](entity-collection-service.md) doc.

Here's an example.

```javascript
import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from 'ngrx-data';

import { Hero } from '../model';

@Injectable()
export class HeroesService extends EntityCollectionServiceBase<Hero> {
  constructor(elementsFactory: EntityCollectionServiceElementsFactory) {
    super('Hero', elementsFactory);
  }

  // ... your special sauce here
}
```

Of course you must provide the custom service before you use it, typically in an Angular `NgModule`.

```javascript
...
import { HeroesService } from './heroes.service';

@NgModule({
  imports: [...],
  declarations: [...],
  providers: [HeroesService]
})
export class HeroesModule {}
```

The following alternative example uses the v6 "tree-shakable" `Injectable()` to provide the service in the root module.

```javascript
@Injectable({ providedIn: 'root' })
export class HeroesService extends EntityCollectionServiceBase<Hero> {
  ...
}
```

You can inject that custom service directly into the component.

```javascript
@Component({...})
export class HeroesComponent {
  heroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;

  constructor(public heroesService: HeroesService) {
    this.heroes$ = this.heroesService.entities$;
    this.loading$ = this.heroesService.loading$;
  }
  ...
}
```

Nothing new so far.
But we want to be able to get the `HeroesService` from `EntityServices.getEntityCollectionService()`
just as we get the default collection services.

This consistency will pay off when the app has a lot of collection services

## Register the custom _EntityCollectionService_

When you register an instance of a custom `EntityCollectionService` with `EntityServices`, other callers of
`EntityServices.getEntityCollectionService()` get that custom service instance.

You'll want to do that before anything tries to acquire it via the `EntityServices`.

One solution is to inject custom collection services in the constructor of the module that provides them,
and register them there.

The following example demonstrates.

```javascript
@NgModule({ ... })
export class AppModule {
  // Inject the service to ensure it registers with EntityServices
  constructor(
    entityServices: EntityServices,
    // custom collection services
    hs: HeroesService,
    vs: VillainsService
    ){
    entityServices.registerEntityCollectionServices([hs, vs]);
  }
}
```

## Sub-class _EntityServices_ for application class convenience

Another useful solution is to create a sub-class of `EntityServices`
that both injects the custom collection services
and adds convenience members for your application.

The following `AppEntityServices` demonstrates.

```javascript
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  EntityCache,
  EntityCollectionServiceFactory,
  EntityServicesBase
} from 'ngrx-data';

import { SideKick } from '../../model';
import { HeroService, VillainService } from '../../services';

@Injectable()
export class AppEntityServices extends EntityServicesBase {
  constructor(
    public readonly store: Store<EntityCache>,
    public readonly entityCollectionServiceFactory: EntityCollectionServiceFactory,

    // Inject custom services, register them with the EntityServices, and expose in API.
    public readonly heroesService: HeroesService,
    public readonly villainsService: VillainsService
  ) {
    super(store, entityCollectionServiceFactory);
    this.registerEntityCollectionServices([heroesService, villainsService]);
  }

  // ... Additional convenience members

  /** get the (default) SideKicks service */
  get sideKicksService() {
    return this.getEntityCollectionService<SideKick>('SideKick');
  }
}
```

`AppEntityServices` injects the two custom collection services, `HeroesService` and `VillainsService`,
which it also exposes directly as convenience properties.

There is no custom collections service for the `SideKick`.
The default service will do.

Nonetheless, we add a `sideKicksService` property that gets or creates a default service for `SideKick`.
Consumers will find this more discoverable and easier to call than `getEntityCollectionService()`.

Of course the base class `EntityServices` members, such as `getEntityCollectionService()`, `entityCache$`,
and `registerEntityCollectionService()` are all available.

Next, provide `AppEntityServices` in an Angular `NgModule` both as itself (`AppEntityServices`)
and as an alias for `EntityServices`.

In this manner, an application class references this same `AppEntityServices` service instance,
whether it injects `AppEntityServices` or `EntityServices`.

See it here in the sample app.

```javascript
// store/entity/entity-module
@NgModule({
  imports: [ ... ],
  providers: [
    AppEntityServices,
    { provide: EntityServices, useExisting: AppEntityServices },
    ...
  ]
})
export class EntityStoreModule { ... }
```

## Access multiple _EntityCollectionServices_

A complex component may need access to multiple entity collections.
The `EntityServices` registry makes this easy,
even when the `EntityCollectionServices` are customized for each entity type.

You'll only need **a single injected constructor parameter**, the `EntityServices`.

```javascript
import { EntityCollectionService, EntityServices } from 'ngrx-data';
import { SideKick } from '../../model';
import { HeroService, VillainService } from '../../services';

@Component({...})
export class CharacterContainerComponent implements OnInit {
  heroesService: HeroService;
  sideKicksService: EntityCollectionService<SideKick>;
  villainService: VillainService;

  heroes$: Observable<Hero>;
  ...
  constructor(entityServices: EntityServices) {
    this.heroesService = entityServices.getEntityCollectionService('Hero');
    this.sidekicksService = entityServices.getEntityCollectionService('SideKick');
    this.villainService = entityServices.getEntityCollectionService('Villain');

    this.heroes$ = this.heroesService.entities$;
    ...
  }
  ...
}
```

An application-specific sub-class of `EntityServices`, such as the `AppEntityServices` above,
makes this much nicer.

```javascript
import { AppEntityServices } from '../../services';

@Component({...})
export class CharacterContainerComponent implements OnInit {

  heroes$: Observable<Hero>;
  ...
  constructor(private appEntityServices: AppEntityServices) {
    this.heroes$ = appEntityServices.heroesService.entities$;
    ...
  }
  ...
}
```
