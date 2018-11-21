# Angular ngrx-data library ChangeLog

### Version numbering

We're trying to keep the major (first) version digit in sync with Angular's major digit.

But we will make breaking changes between Angular's major releases.
What to do?

Our convention is that patch releases (the 3rd digit) shouldn't be breaking.

But "minor" releases (the middle digit) may be breaking and are certainly "major" from the perspective of an ngrx-data user.

If you want to install updates but want to prevent accidental installation of a "major" ngrx-data release, use the `~` form of the npm package version constraint.

In other words, it is safer to have something like the following in your `package.json`

```
"ngrx-data": "~6.0.2",
```

as this will keep you from installing `6.1.x`.

<hr>
<a id="6.1.0-beta.3"></a>

# 6.1.0-beta.3 (2018-11-20)

No breaking changes

* DataServiceError does better job of creating a useful message from the error passed to its ctor.
* Fix `EntityDispatcherBase.upsert` action (should upsert not add) issue #201.

<a id="6.1.0-beta.2"></a>

# 6.1.0-beta.2 (2018-10-22)

No functional changes. Extend `peerDependencies` to include Angular v7 versions.

* corrects mistaken change to @ngrx peer dependencies in briefly-lived beta.1

<a id="6.1.0-beta.0"></a>

# 6.1.0-beta.0 (2018-10-09)

Advance to Beta. No changes. The new APIs are working well in a production application and there are no reported issues with them.

<a id="6.1.0-alpha.4"></a>

# 6.1.0-alpha.4 (2018-10-01)

Fix: missing `@Optional()` on `EntityCacheDataService` constructor parameter

<a id="6.1.0-alpha.3"></a>

# 6.1.0-alpha.3 (2018-10-01)

Non-breaking enhancements to _saveEntities_

The ngrx-data reducers that handle a successful save need a `ChangeSet` to update the cache.
For this reason, in prior versions, _the server had to respond with a_ `ChangeSet`.

Often the server processes the saved entities without changing them.
There's no need to return a result.
The original request `ChangeSet` has all the information necessary to update the cache.
Responding with a `"204-No Content"` instead would save time, bandwidth, and processing.

In this version, a server can respond `"204-No Content"` and send back nothing.
The `EntityCacheEffects` recognizes this condition and
returns a success action _derived_ from the original request `ChangeSet`.

If the save was pessimistic, it returns `SaveEntitiesSuccess` with the original `ChangeSet`.

If the save was optimistic, the changes are already in the cache and there's no point in updating the cache;
instead, the effect returns a merge observable that clears the loading flags for each entity type
in the original `CacheSet`.

<a id="6.1.0-alpha.2"></a>

# 6.1.0-alpha.2 (2018-09-19)

Non-breaking enhancements

* add `ChangeSetItemFactory` and `changeSetItemFactory` instance to make creating a `ChangeSet` easier.
* add `excludeEmptyChangeSetItems` function that filters out empty changes in `ChangeSet`s.
* `EntityCacheDataService.saveEntities` calls `excludeEmptyChangeSetItems` before sending to the server.
* if no changes to save, `EntityCacheEffect.saveEntities` returns success immediately, w/o calling data service.
* changed _prettier_ line length from 140 to 100 which will cause innocuous file changes over time.

_TODO: more unit tests_

* `EntityCacheDataService`
* `EntityCacheDispatcher`

<a id="6.1.0-alpha.1"></a>

# 6.1.0-alpha.1 (2018-09-18)

A "major" release with significant new features.

There are some breaking changes but they won't affect many users and they are easy to find and fix.

## Feature: Save multiple entities in the same transaction

Many apps must save several entities at the same time in the same transaction.

As of version 6.1, multi-entity saves are a first class feature.
By "first class" we mean that ngrx-data offers a built-in, multiple-entity save solution that
is consistent with ngrx-data itself:

* defines a `ChangeSet`, describing `ChangeOperations` to be performed on multiple entities of multiple types.
* has a set of `SAVE_ENTITIES...` cache-level actions.
* has an `EntityCacheDispatcher` to dispatch those actions.
* offers `EntityCacheEffects` that sends `SAVE_ENTITIES` async requests to the server and
  returns results as `SAVE_ENTITIES_SUCCESS` or `SAVE_ENTITIES_ERROR` actions.
* offers a default `EntityCacheDataService` to make those http server requests.
* integrates with change tracking.
* delegates each collection-level change to the (customizable) `entity-collection-reducer-methods`.

The new ["Multiple Entity Saves" document](../docs/save-entities.md) explains how it works.

## Feature: Save upsert

In an "upsert" save, the entity may be new or exist on the server.
It is up to the server to accept and implement either alternative when it receives the request.

The `DefaultEntityService` implementation sends an HTTP POST to the supporting resource URL.
Only call the `upsert` method if your server implement upsert.

The server should return the entity, whether it adds a new one or updates an existing one.
The `EntityEffects` implementation ensures that the `SAVE_UPSERT_ONE_SUCCESS` payload
includes original entity data if the server doesn't return an entity.

* Extends `EntityCollectionDataService` interface with `upsert` method
* Extends `EntityDataService` with the `upsert` method
* Extends `DefaultDataService` with the `upsert` method
* Adds `SAVE_UPSERT_ONE...` actions to `EntityOp`
* Extends `EntityCollectionReducerMethod` with support for `SAVE_UPSERT_ONE...`
* Extends `EntityEffects` to handle `SAVE_UPSERT_ONE`
* Extends `EntityCommands` with the `upsert` method
* Extends `EntityDispatcherBase` with the `upsert` method.
* Extends `EntityDispatcherDefaultOptions` with `optimisticUpsert: false`
* Extends `EntityEffects` with support for `SAVE_UPSERT_ONE`

## Feature (minor): _EntityOp.CANCELED_PERSIST_

The `EntityEffect.persist$` emits this action if an `EntityOp.CANCEL_PERSIST` action
succeeded in blocking the service response to a matching persistence action.

See the ["Entity Effects" document](../docs/entity-entities.md).

**BREAKING CHANGES**:

* Extension of `EntityCollectionDataService` interface with `upsert` method could break
  custom implementations of that interface.

* Extension of `EntityDispatcherDefaultOptions` may break a custom implementation
  or may leave the new `optimisticUpsert` and `optimisticSaveEntities` in an unwanted state.

<a id="6.0.2-beta.10"></a>

# 6.0.2-beta.10 (2018-07-17)

**Feature: ClearCollections and LoadCollections cache actions**

Added `ClearCollections` and `LoadCollections` entity cache actions so you can
clear or load multiple collections at the same time.
See `entity-cache-reducer.spec.ts` for examples.

**Minor tweaks to improve testability**:

* `EntityServicesBase.constructor` implementation is now empty.
  Public readonly fields that were wired inside the constructor are now getter properties
  reading from `EntityServicesElements`.
  This makes it possible to instantiate an `EntityServicesBase` derivative with a null `EntityServicesElement` argument, which makes testing with derivative classes a little easier.

**BREAKING CHANGES**:

* `EntityServicesElements` public members changed to deliver what `EntityServices` needs without dotting to get there. This makes it easier to mock.

But it is a breaking change for anyone who derived from `EntityServices` and injected the `store`.
You might see a message like this one:

```
zone.js:665 Unhandled Promise rejection: Cannot set property store of [object Object] which has only a getter ;
Zone: <root> ; Task: Promise.then ; Value: TypeError: Cannot set property store of [object Object] which has only a getter
at new AppEntityServices (app-entity-services.ts:41) <-- the name of your derived class
```

You're probably injecting the `Store<EntityCache`> as a public property.
Remove that from your constructor and you'll be fine.
It's already exposed as a protected `store` property which you can make public if you wish.

* `EntityCollectionServiceElementsFactory.getServiceElements()` renamed `create()`,
  the proper verb for a factory class.

<a id="6.0.2-beta.9"></a>

# 6.0.2-beta.9 (2018-07-02)

Fixes #163. Allows Angular peer dependency to change as long as it is version 6.x.x

```
 -   "@angular/core": "6.0.0",
 -   "@angular/common": "6.0.0",
 +   "@angular/core": "^6.0.0",
 +   "@angular/common": "^6.0.0",
```

Fixes issue #165 related to the breaking change in Beta.7 in which the
return type of `EntityCollectionDataService.update()` changed:

```
-  update(update: Update<T>): Observable<Update<T>>;
+  update(update: Update<T>): Observable<T>;
```

The re-implementation of `DefaultDataService` accidentally sent the `Update<T>`
to the server instead of just the entity data, T.

This release corrects that error and adds confirming tests.

It incidentally changes the handling of the changed indicator ()
that is created by the `EntityEffects` after the update succeeds.

* the indicator property name was renamed from `unchanged` to `changed`.
* the `EntityEffects` _always sets it_ after update (used to set it only when changed).
* adjusted `EntityChangeTracker` which consumed the `changed` property .

<a id="6.0.2-beta.8"></a>

# 6.0.2-beta.8 (2018-06-27)

Minor internal refactoring

* `EntityActionFactory` - Polymorphic `create` method delegates to mono-morphic `createCore` method
  which makes the factory easier to sub-class.

<a id="6.0.2-beta.7"></a>

# 6.0.2-beta.7 (2018-06-26)

This **major release** is primarily about the new, _change tracking_ feature,
which makes _optimistic saves_ a viable choice (possibly the preferred choice),
now that you can recover from a save error by undoing (reverting) to the last known state of the entities on the server.

This new feature provoked a cascade of changes, most of them related to change tracking.

**Many of them are breaking changes**.
Please pay close attention to the details of this release notification.

## Features

The new features that we think will be most widely appreciated are:

* ChangeTracking

  * It makes optimistic saves a viable first choice
  * It lets you accumulate unsaved-changes in cache and then save them together transactionally if your server supports that.

* The `EntityCollectionService` query and save commands return an `Observable` result.

* Multiple queries and saves can be in progress concurrently.

* You can cancel long-running server requests with `EntityCollectionService.cancel(correlationId)`.

* The `MergeQuerySet` enables bulk cache updates with multiple collection query results.

Look for these features below.

### Change Tracking

EntityCollections, reducers, and selectors support change tracking and undo
via the rewritten `EntityChangeTracker` and the
new `EntityCollection.changeState` property which replaces the `originalValues` property.

Previously change tracking and undo were an incomplete, alpha feature.

The ngrx-data now tracks changes properly by default and you can **_undo unsaved changes_**, reverting to the last know state of entity (or entities) on the server.
This gives the developer a good option for recovering from optimistic saves that failed.

#### Effect on delete

Thanks to change tracking, we can tell when an entity that you're about to delete has been added locally but not saved to the server.
Ngrx-data now removes such entities immediately, even when the save is pessimistic, and silently side-steps the
HTTP DELETE request, which has nothing to remove on the server and might 404.

In order to tell `EntityEffects.persist$` to skip such deletes, we had to add a mutable `EntityAction.skip` flag to the `EntityAction`.

The `skip` flag is `false` by default.
Ngrx-data only sets it to `true` when the app tries to save the deletion of an added, unsaved entity.

We're not thrilled about adding another mutable property to `EntityAction`.
But we do not know of another way to tell `EntityEffects` to skip the HTTP DELETE request which might otherwise have produced an error.

#### Disable tracking

The new `EntityMetadata.noChangeTracking` flag, which is `false` by default,
can be set `true` in the metadata for a collection.
When `true`, ngrx-data does not track any changes for this collection
and the `EntityCollection.changeState` property remains an empty object.

You can also turnoff change tracking for a specific, cache-only action by choosing passing the `MergeStrategy.IgnoreTracking` as an option to the command.

See [entity-change-tracker.md](../docs/entity-change-tracker.md) for discussion and details.

### Other Features

#### Dispatcher query and save methods return Observables

The dispatcher query and save methods (`add`, `delete`, `update`, and `upsert`) used to return `void`.
That was architecturally consistent with the CQRS pattern in which (c)ommands never return a result.
Only (q)ueries in the guise of selectors returned values by way of Observables.

The CQRS principle had to give way to practicality.
Real apps often "wait" (asynchronously of course) until the save result becomes known.
Ngrx-data saves are implemented with an ngrx _effect_ and
effects decouple the HTTP request from the server result.
It was difficult to know when a save operation completed, either successfully or with an error.

In this release, **each of these methods return a terminating Observable of the operation result** which emits when the
server responds and after the reducers have applied the result to the collection.

> Cache-only commands, which are synchronous, continue to return `void`.

Now you can subscribe to these observables to learn when the server request completed and
to examine the result or error.

```
heroService.add(newHero).subscribe(
  hero => ...,
  error => ...
);
```

> See the `EntityServices` tests for examples.

This feature simplifies scenarios that used to be challenging.
For example, you can query for the master record and then
query for its related child records as in the following example.

```
heroService.getByKey(42)
  .pipe(hero => {
   sideKickService.getWithQuery({heroId: hero.id}),
   map(sideKicks => {hero, sideKicks})
  })
  .subscribe((results: {hero: Hero, sideKicks: SideKicks}) => doSomething(results));
```

Of course you can stay true to CQRS and ignore these results.
Your existing query and save command callers will continue to compile and run as before.

This feature does introduce a _breaking change_ for those apps that create custom entity collection services
and override the base methods.
These overrides must now return an appropriate terminating Observable.

#### Cancellation with the correlation id

The ngrx-data associates the initiating action (e.g., `QUERY_ALL`) ngrx-data to the reply actions
(e.g,. `QUERY_ALL_SUCCESS` and `QUERY_ALL_ERROR` with a _correlation id_,
which it generates automatically.

Alternatively you can specify the `correlationId` as an option.
You might do so in order to cancel a long-running query.

The `EntityCollectionService` (and dispatcher) offer a new `cancel` command that dispatches an EntityAction
with the new `EntityOp.CANCEL-PERSIST`.

You pass the command the correlation id for the action you want to cancel, along with an optional reason-to-cancel string.

```
// Too much time passes without a response. The user cancels
heroCollectionService.cancel(correlationId, 'User canceled');
```

The `EntityCollectionReducer` responds to that action by turning off the loading flag
(it would be on for a persistence operation that is still in-flight).

The `EntityEffects.cancel$` effect watches for `EntityOp.CANCEL-PERSIST` actions and emits the correlation id.
Meanwhile, the `EntityEffects.persist$` is processing the persistance EntityActions.
It cancels an in-flight server request when it that `cancel$` has emitted
the corresponding persistence action's correlation id.

The observable returned by the original server request (e.g., `heroCollectionService.getAll(...)`)
will emit an error with an instance of `PersistanceCanceled`, whose `message` property contains the cancellation reason.

This `EntityService` test demonstrates.

```
// Create the correlation id yourself to know which action to cancel.
const correlationId = 'CRID007';
const options: EntityActionOptions = { correlationId };
heroCollectionService.getAll(options).subscribe(
  data => fail('should not have data but got data'),
  error => {
    expect(error instanceof PersistanceCanceled).toBe(true, 'PersistanceCanceled');
    expect(error.message).toBe('Test cancel');
    done();
  }
);

heroCollectionService.cancel(correlationId, 'User canceled');
```

Note that cancelling a command may not stop the browser from making the HTTP request
and it certainly can't stop the server from processing a request it received.

It will prevent ngrx-data `EntityEffect` from creating and dispatching the success or failure
actions that would otherwise update the entity cache.

#### HTTP requests from `EntityCollectionService` query and save commands are now concurrent.

The `EntityCollectionService` query and save commands (e.g `getAll()` and `add()`) produce EntityActions that are handled by the `EntityEffects.persist$` effect.

`EntityEffects.persist$` now uses `mergeMap` so that multiple HTTP requests may be in-flight concurrently.

The `persist$` method previously used `concatMap, forcing each request to wait until the previous request finished.

This change may improve performance for some apps.

> It may also break an app that relied on strictly sequential requests.

The `persist$` method used `concatMap` previously because there was no easy way to control the order of HTTP requests
or know when a particular command updated the collection.

Now, the command observable tells you when it completed and how.
And if command A must complete before command B, you can pipe the command observables appropriately,
as seen in the "hero/sidekick" example above.

#### _EntityDispatcherDefaultOptions_ can be provided.

Previously the default for options governing whether saves were optimistic or pessimistic was
hardwired into the `EntityDispatcherFactory`.
The defaults were deemed to be the safest values:

```
/** True if added entities are saved optimistically; False if saved pessimistically. */
optimisticAdd: false;

/** True if deleted entities are saved optimistically; False if saved pessimistically. */
optimisticDelete: true;

/** True if updated entities are saved optimistically; False if saved pessimistically. */
optimisticUpdate: false;
```

You could (and still can) change these options at the collection level in the entity metadata.
But you couldn't change the _defaults for all collections_.

Now the collection defaults are in the `EntityDispatcherDefaultOptions` service class, which is
provided in the `NgrxDataWithoutEffectsModule`.

Your app can provide an alternative to change these defaults.
For example, you could make all save operations optimistic by default.

```
@Injectable()
export class OptimisticDispatcherDefaultOptions {
  optimisticAdd = true;
  optimisticDelete = true;
  optimisticUpdate = true;
}

@NgModule({
  imports:   [ NgrxDataModule.forRoot({...}) ],
  providers: [
    { provide: EntityDispatcherDefaultOptions, useClass: OptimisticDispatcherDefaultOptions },
    ...
  ]
})
export class EntityStoreModule {}
```

#### Removed _OPTIMISTIC..._ EntityOps in favor of a flag (breaking change)

The number of EntityOps and corresponding `EntityCollectionReducer` methods have been growing (see below).
Getting rid of the `OPTIMISTIC` ops is a welcome step in the other direction and makes reducer logic
a bit simpler.

You can still choose an optimistic save with the action payload's `isOptimistic` option.
The dispatcher defaults (see `EntityDispatcherDefaultOptions`) have not changed.
If you don't specify `isOptimistic`, it defaults to `false` for _adds_ and _updates_ and `true` for _deletes_.

#### `EntityAction` properties moved to the payload (breaking change)

The properties on the `EntityAction` was also getting out of hand.
Had we continued the trend, the `MergeStrategy` and the `isOptimistic` flag would have
joined `entityName`, `op`, `tag` (FKA `label`), `skip`, and `error` as properties of the `EntityAction`.
Future options would mean more action properties and more complicated EntityAction creation.

This was a bad trend. From the beginning we have been uncomfortable with adding any properties to the action
as ngrx actions out-of-the-box are just a _type_ and an optional _payload_.

Now almost all properties have moved to the payload.

```
// entity-action.ts
export interface EntityAction<P = any> extends Action {
  readonly type: string;
  readonly payload: EntityActionPayload<P>;
}

export interface EntityActionPayload<P = any> {
  readonly entityName: string;
  readonly op: EntityOp;
  readonly data?: P;
  readonly correlationId?: any;
  readonly isOptimistic?: boolean;
  readonly mergeStrategy?: MergeStrategy;
  readonly tag?: string;

  // Mutable.
  error?: Error;
  skip?: boolean;
}
```

#### New _QUERY_LOAD_ EntityOp

`QUERY_ALL` used to fetch all entities of a collection and `QUERY_ALL_SUCCESS`
reset the collection with those entities.
That's not always correct.
Now that you can have unsaved changes, including unsaved adds and deletes,
querying for all entities should be able to leave those pending changes in place and
merely update the collection.

That's how `QUERY_ALL...` behaves as of this release.
The `QUERY_ALL_SUCCESS` **merges** entities with the collection, based on the
change tracking

Yet there is still a need to _both_ clear the collection _and_ reinitialize if with all fetched entities.
While you could achieve this with two actions, `REMOVE_ALL` and `QUERY_ALL`,
the new `QUERY_LOAD...` does both more efficiently.

The new `QUERY_LOAD...` resets entity data, clears change tracking data, and
sets the loading (false) and loaded (true) flags.

#### Added `SET_COLLECTION` EntityOp to completely replace the collection.

Good for testing and rehydrating collection from local storage.
Dangerous. Use wisely and rarely.

#### Added `EntityCacheAction.MERGE_QUERY_SET`

The new `EntityCacheAction.MERGE_QUERY_SET` action and corresponding `MergeQuerySet(EntityQuerySet)` ActionCreator class can merge query results
from multiple collections into the EntityCache using the `upsert` entity collection reducer method.
These collections all update at the same time before selectors fire.

This means that collection `selectors$` emit _after all collections have been updated_.

Previously, you had to merge into each collection individually.
Each collections `selectors$` would emit
after each collection merge.
That behavior could provoke an unfortunate race condition
as when adding order line items before the parent order itself.

> `EntityServices` tests demonstrate these points.

#### Added `EntityServices.entityActionErrors$`

An observable of **error** `EntityActions` (e.g. `QUERY_ALL_ERROR`) for all entity types.

#### _CorrelationIdGenerator_ and _Guid_ utility functions

Ngrx-data needs a `CorrelationIdGenerator` service to coordinate multiple EntityActions.

The entity dispatcher save and query methods use it to generate correlation ids that
associate a start action with its corresponding success or error action.

The ngrx-data `CorrelationIdGenerator.next()` method produces a string
consisting of 'CRID' (for "<b>c</b>o<b>r</b>relation **id**") plus an increasing integer.

Correlation ids are unique for a single browser session only.
Do not use for entity ids.
Use the _GUID_ utilities to generate entity ids.

You can replace this generator by providing an alternative implementation with a `next()` method
that returns a value of any type that serves the purpose.

The new GUID utility functions - `getGuid()`, `getUuid()`, and `getGuidComb()` - generate pseudo-GUID strings
for client-side id generation.
The `getGuidComb()` function produces sequential guids which are sortable and often nice to SQL databases.

All three produce 32-character hexadecimal UUID strings, not the 128-bit representation found in server-side languages and databases. That's less than ideal but we don't have a better alternative at this time.

> The GUID utility functions are not used by ngrx-data itself at this time
> They are included as candidates for generating persistable correlation ids if that becomes desirable.
> These utilities are classified as _experimental_ and may be withdrawn or replaced in future.

## Breaking Changes

### Change-tracking-related

The change tracking feature required replacement of the `EntityCollection.originalValues` with `EntityCollection.changeState`.

The `originalValues` property is now the `originalValue` (singular) property of `changeState`,
which also has a `changeType` property that tells you what kind of unsaved change is being tracked.

The `EntitySelectors.selectOriginalValues` and `Selectors$.originalValues$` are replaced by
`EntitySelectors.selectChangeState` and `Selectors$.selectChangeState$`

The `EntityReducerMethods` have changed to include change tracking.
This will not affect most apps but it does mean that actions which previously did not change the collection
may do so now by virtue of updates to the collection's `changeState` value.

The `EntityDataService.update()` method still takes an `Update<T>` but it
returns the update entity (or null) rather than an `Update<T>`.

**If you wrote a custom `EntityDataService`, you must change the result of your `update` method accordingly.**

The `EntityEffects.persist$` now handles transformation of HTTP update results
into the `Update<T>` before creating the update "success" actions that are
dispatched to the store.

Moving this responsibility to the `EntityEffects` makes it a little easier to
write custom `EntityDataServices`, which won't have to deal with it,
while ensuring that the success action payload dispatched to the store
arrives at the reducer with the information needed for change tracking.

The app or its tests _might_ expect ngrx-data to make DELETE requests when processing SAVE_DELETE... actions
for entities that were added to the collection but not yet saved.

As discussed above, when change tracking is enabled, ngrx-data no longer makes DELETE requests when processing SAVE_DELETE... actions
for entities that were added to the collection but not yet saved.

It is possible that an app or its tests expected ngrx-data to make these DELETE requests. Please correct your code/tests accordingly.

### Other Breaking Changes

The ChangeTracking feature has such a profound effect on the library, involving necessary breaking changes, that the occasion seemed ripe to address longstanding problems and irritants in the architecture and names.
These repairs include additional breaking changes.

#### Custom `EntityCollectionService` constructor changed.

Previously, when you wrote a custom `EntityCollectionService`, you injected the `EntityCollectionServiceFactory` and passed it to your constructor like this.

```
import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceFactory } from 'ngrx-data';

import { Hero } from '../core';

@Injectable({ providedIn: 'root' })
export class HeroesService extends EntityCollectionServiceBase<Hero> {
  constructor(serviceFactory: EntityCollectionServiceFactory) {
    super('Hero', serviceFactory);
  }
  // ... your custom service logic ...
}
```

This was weird.
You don't expect to inject the factory that makes that thing into the constructor of that thing.

In fact, `EntityCollectionServiceFactory` wasn't behaving like a service factory.
It merely exposed _yet another unnamed factory_, which made the core elements necessary for the service.

This version of ngrx-data makes that elements factory explicit (`EntityCollectionServiceElementsFactory`).

Unfortunately, this breaks your custom services.
You'll have to modify them to inject and use the elements factory instead of the colletion service factory.

Here's the updated `HeroesService` example:

```
import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from 'ngrx-data';

import { Hero } from '../core';


@Injectable({ providedIn: 'root' })
export class HeroesService extends EntityCollectionServiceBase<Hero> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Hero', serviceElementsFactory);
  }
  // ... your custom service logic ...
}
```

#### Custom `EntityServices` constructor changed.

Those app custom `EntityServices` classes that derive from the `EntityServicesBase` class
must be modified to suit the constructor of the new `EntityServicesBase` class.

This change simplifies construction of custom `EntityServices` classes
and reduces the risk of future change to the base class constructor.
As the base `EntityServices` class evolves it might need new dependencies.
These new dependencies can be delivered by the injected `EntityServicesElements` service,
which can grow without disturbing the application derived classes.

This manner of insulating custom classes from future library changes
follows the _elements_ pattern used by the `EntityCollectionService`, as described above.

Here is a custom `AppEntityServices` written for the _previous ngrx-data release_.

```
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  EntityCache,
  EntityCollectionServiceFactory,
  EntityServicesBase
} from 'ngrx-data';

import { HeroesService } from '../../heroes/heroes.service';
import { VillainsService } from '../../villains/villains.service';

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
}
```

The updated `AppEntityServices` is slightly smaller with fewer imports.

```
import { Injectable } from '@angular/core';
import { EntityServicesElements, EntityServicesBase } from 'ngrx-data';

import { HeroesService } from '../../heroes/heroes.service';
import { VillainsService } from '../../villains/villains.service';

@Injectable()
export class AppEntityServices extends EntityServicesBase {
  constructor(
    entityServicesElements: EntityServicesElements,

    // Inject custom services, register them with the EntityServices, and expose in API.
    public readonly heroesService: HeroesService,
    public readonly villainsService: VillainsService
  ) {
    super(entityServicesElements);
    this.registerEntityCollectionServices([heroesService, villainsService]);
  }
}
```

#### `EntityServices.store` and `.entityCollectionServiceFactory` no longer in the API.

We could not see why these members should be part of the public `EntityServices` API.
Removed them so we don't have to support them.

A custom `EntityService` could inject them in its own constructor if need be.
Developers can petition to re-expose them if they can offer good reasons.

#### `EntityAction` properties moved to the payload.

This change, described earlier, affects those developers who worked directly with `EntityAction` instances.

#### `EntityActionFactory.create` signature changed.

The relocation of `EntityAction` properties to the payload forced changes to the `EntityActionFactory`,
most significantly its `create` signatures.

The `create` method no longer accepts a source action.
Use `createFromAction` instead.

This is a breaking change for anyone sub-classing `EntityActionFactory` or calling it directly with
one of its lesser used `create` signatures.

#### `EntityAction.op` property renamed `entityOp`

While moving entity action properties to `EntityAction.payload`, the `op` property was renamed `entityOp` for three reasons.

1.  The rename reduces the likelihood that a non-EntityAction payload has a similarly named property that
    would cause ngrx-data to treat the action as an `EntityAction`.

1.  It should always have been called `entityOp` for consistency with its type as the value of the `EntityOp` enumeration.

1.  The timing is right because the relocation of properties to the payload is already a breaking change.

#### _EntityCollectionService_ members only reference the collection.

Formerly such services exposed the `entityCache`, the `store` and a `dispatch` method, all of which are outside of the `EntityCollection` targeted by the service.

They've been removed from the `EntityCollectionService` API.
Use `EntityServices` instead to access the `entityCache`, a general dispatcher of `Action`, etc.

#### Service dispatcher query and save methods must return an Observable

The query and save commands should return an Observable as described above. This is a _breaking change_ for those apps that create custom entity collection services
and override the base methods.
Such overrides must now return an appropriate terminating Observable.

#### `EntityEffects.persist$` uses `mergeMap` instead of `concatMap`.

`EntityEffects.persist$` uses `mergeMap` so that multiple HTTP requests may be in-flight concurrently.

Previously used `concatMap`, which meant that ngrx-data did not make a new HTTP request until the previous request finished.

This change may break an app that counted upon strictly sequential HTTP requests.

#### Renamed `EntityAction.label`.

The word "label" is semantically too close to the word "type" in `Action.type` and easy to confuse with the type.
"Tag" conveys the freedom and flexibility we're looking for.
The EntityAction formatter will embed the "tag" in the type as it did the label.
We hope that relatively few are affected by this renaming.

More significantly, the tag (FKA label) is now part of the payload rather than a property of the action.

#### `ADD_ALL` resets the loading (false) and loaded (true) flags.

#### Deleted `MERGE_ENTITY_CACHE`.

The cache action was never used by ngrx-data itself.
It can be easily implemented with
`ENTITY_CACHE_SET` and a little code to get the current entity cache state.

#### Moved `SET_ENTITY_CACHE` under `EntityCacheAction.SET_ENTITY_CACHE`.

#### Eliminated the `OPTIMISTIC` variations of the save `EntityOps`.

These entityOps and their corresponding reducer methods are gone.
Now there is only one _add_, _update_, and _delete_ operation.
Their reducers behave pessimistically or
optimistically based on the `isOptimistic` flag in the `EntityActionOptions` in the action payload.

This change does not affect the primary application API and should break only those apps that delved below
the ngrx-data surface such as apps that implement their own entity action reducers.

#### _EntityReducerFactory_ is now _EntityCacheReducerFactory_ and _EntityCollectionReducerRegistry_

The former `_EntityReducerFactory_` combined two purposes

1.  Creator of the reducer for actions applying to the `EntityCache` as a whole.
2.  Registry of the `EntityCollectionReducers` that apply to individual collections.

The need for separating these concerns became apparent as we enriched the actions that apply to the entire `EntityCache`.

This change breaks apps that registered collection reducers directly with the former `_EntityReducerFactory_`.
Resolve by importing `EntityCollectionReducerRegistry` instead and calling the same registration methods on it.

#### _EntityCollectionDataService.update()_ signature changed

The return type of `EntityCollectionDataService.update()` changed,
affecting implementation of `DefaultDataService.ts` and
any override of that method in an application derived class
(see issue #165).

```
-  update(update: Update<T>): Observable<Update<T>>;
+  update(update: Update<T>): Observable<T>;
```

This lead to a bad bug in the `DefaultDataService.update()`, corrected in [Beta 9](#6.0.2-beta.9)

#### Renamed _DefaultEntityCollectionServiceFactory_ to _EntityCollectionServiceFactoryBase_.

Renamed for consistence with other members of the _EntityServices_ family.
A breaking change for the rare app that referenced this factory directly.

#### Renamed _DefaultDispatcherOptions_ to _EntityDispatcherDefaultOptions_.

Renamed for clarity.

<a id="6.0.0-beta.6"></a>

# 6.0.0-beta.6 (2018-05-24)

## _EntityActions_ replaced by _EntityAction operators_

_BREAKING CHANGE_

Sub-classing of `Observable` is deprecated in v.6, in favor of custom pipeable operators.

Accordingly, `EntityActions` has been removed.
Use the _EntityAction_ operators, `ofEntityOp` and `ofEntityType` instead.

Before

```typescript
// Select HeroActions
entityActions.ofEntityType('Hero).pipe(...);

// Select QUERY_ALL operations
entityActions.ofOp(EntityOp.QUERY_ALL).pipe(...);
```

After

```typescript
// Select HeroActions
entityActions.pipe(ofEntityType('Hero), ...);

// Select QUERY_ALL operations
entityActions.pipe(ofEntityOp(EntityOp.QUERY_ALL, ...);
```

The `EntityActions.where` and `EntityActions.until` methods have not been replaced.
Use standard RxJS `filter` and `takeUntil` operators instead.

Here's a real-world example of the changes that may be necessary.

Before

```typescript
import { Injectable } from '@angular/core';
import { EntityActions, OP_ERROR, OP_SUCCESS } from 'ngrx-data';
import { ToastService } from '@core/services/toast.service';

/** Report ngrx-data success/error actions as toast messages **/
@Injectable()
export class NgrxDataToastService {
  constructor(actions$: EntityActions, toast: ToastService) {
    actions$
      .where(ea => ea.op.endsWith(OP_SUCCESS) || ea.op.endsWith(OP_ERROR))
      // this service never dies so no need to unsubscribe
      .subscribe(action => toast.openSnackBar(`${action.entityName} action`, action.op));
  }
}
```

After

```typescript
import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects'; // <-- import @ngrx/effects/Actions
import { EntityAction, ofEntityOp, OP_ERROR, OP_SUCCESS } from 'ngrx-data'; // <-- EntityActions replaced

import { filter } from 'rxjs/operators'; // <-- no more "where"; you'll filter it yourself

import { ToastService } from '@core/services/toast.service';

/** Report ngrx-data success/error actions as toast messages **/
@Injectable()
export class NgrxDataToastService {
  constructor(actions$: Actions, toast: ToastService) {
    // <-- inject @ngrx/effects/Actions

    actions$
      .pipe(
        // <-- use a pipe
        // this service never dies so no need to unsubscribe
        // filter first for EntityActions with ofEntityOp()  (those with an EntityOp)
        ofEntityOp(),
        // use filter() instead of where()
        filter((ea: EntityAction) => ea.op.endsWith(OP_SUCCESS) || ea.op.endsWith(OP_ERROR))
      )
      .subscribe(action => toast.openSnackBar(`${action.entityName} action`, action.op));
  }
}
```

## Other Features

* `NgrxDataModuleWithoutEffects` is now public rather than internal.
  Useful for devs who prefer to opt out of @ngrx/effects for entities and to
  handle HTTP calls on their own.

Import it instead of `NgrxDataModule`, like this.

```typescript
@NgModule({
  imports: [
    NgrxDataModuleWithoutEffects.forRoot(appNgrxDataModuleConfig),
    ...
  ],
  ...
})
export class EntityAppModule {...}
```

<a id="6.0.0-beta.5"></a>

# 6.0.0-beta.5 (2018-05-23)

* Update to `@ngrx v.6.0.1` (updated package.json)

* Update to **ng-packagr** `v.3.0.0-rc.5` which fixes issue #156 (for no apparent reason)
  while causing a _different ng-Packagr compilation error_,
  one that is both rare and easily worked around (see [ng-packager issue 901](https://github.com/dherges/ng-packagr/issues/901))
  (note: these changes were committed directly to master in SHA ede9d (ede9d39d776752ba2e2fa03d48c06a7f0bbbbf30)).

<a id="6.0.0-beta.4"></a>

# 6.0.0-beta.4 (2018-05-22)

* Fix: DefaultDataService return the deleted entity's id, which is then forwarded in the payload
  of the DELETE*SUCCESS and DELETE_OPTIMISTIC_SUCCESS entity operations.
  Necessary for pessimistic delete to remove the item from the collection \_after* the server responds.
  Fixes #154.

* Feature: Default reducer sets collection's `loaded` flag true in ADD\*ALL action. Used to only do so in QUERY_ALL_SUCCESS. This \_might be a **breaking change\*** for a very few.

<a id="6.0.0-beta.3"></a>

# 6.0.0-beta.3 (2018-05-18)

### Breaking Change: collection loading flag behavior

Now all save operations turn the collection **loading flag**
on at the start and off at the end.
See the `DefaultEntityCollectionReducerMethods`.

Reducers used to only toggle the loading flag on for queries.
That was a mistake because there could not easily tell when a server create/update/delete had completed.
Now you can subscribe or pipe onto the collection's `loading` flag to learn when any server operation
for that collection has begun and when it terminates (whether successfully or with an error).

Also, every action has it its own method, even when those methods simply turn the loading flag on or off.
This change allows you to sub-class `DefaultEntityCollectionReducerMethods` and use method overrides to
customize it rather than simply replace a method in the `reducerMethods` dictionary.

`DefaultEntityCollectionReducerMethods.methods` expose the dictionary of methods corresponding to an entity action.

### Other

* refactored `DefaultLogger` for better console output.
* delete reducers now accept the entity as well as just the entity id

<a id="6.0.0-beta.2"></a>

# 6.0.0-beta.2 (2018-05-08)

### BREAKING CHANGE: "EntityService..." renamed "EntityCollectionService..."

Every symbol with "EntityService" in the name has been renamed with "EntityCollectionService" in that name for two reasons:

1.  Every one of these renamed artifacts concerned a single _EntityCollection_.
    This was not clear in the former name and one could easily think that the service concerned all collections or some other part of the ngrx-data system. Such uncertainty becomes more likely in the next point.

2.  This release adds `EntityServices` which provides services across all entity collections managed by ngrx-data.

In a related change, the former `EntityService.entityCache$` selector has been removed from the collection-level services, where it did not belong, and added to the new `EntityServices.entityCache$`.

### New Features

* Add `EntityServices` and `EntityServicesBase`

  The new `EntityServices` interface describes provides services for all collection-level `EntityCollectionService` and includes some API members for access to the entire entity cache.

  The `EntityServiceBase` is the default implementation which you can sub-class to tailor to your application needs.

  See the _Entity Services_ doc (in the repo at `docs/entity-services.md`) for a discussion and
  examples of this new class.

<a id="6.0.0-beta.1"></a>

# 6.0.0-beta.1 (2018-05-08)

### BREAKING CHANGES: Update to Angular/RxJS/NgRX v6

* Converted to RxJS v6.0.1 _without the compat library_
* Converted to Angular v6.0.0
* Converted to NgRX v6.0.0-beta.1
* Update no longer uses upsert (because `@ngrx/entity` upsert no longer takes an `Update<T>`).
* Can no longer change the pk via upsert (same reason).

### New Features

* Add `ENTITY_CACHE_META_REDUCERS`

* Add `INITIAL_ENTITY_CACHE_STATE`

* Add optional `label` to `EntityAction` and `EntityActionFactory.create()` as described in
  `entity-actions.md`.

<hr>

<a id="1.0.0-beta.13"></a>

# 1.0.0-beta.13 (2018-05-04)

<a id="1.0.0-beta.13"></a>

Fix AOT build error (#145) by removing all barrels.

Beta 12 _did not work_. It only seemed to for the one use case (#135).
Removing all barrels from the top level `lib/src/index.ts` seems to work.
Removed all barrels everywhere to prevent future trouble.

# 1.0.0-beta.12 (2018-05-04)

### Utils and Pluralizer

Fix AOT build error (#135) by moving `export * from './utils';` to the top of `/lib/src/index.ts`. (**Did not work; see Beta 13.**)

These fixes should not break library consumers because they cannot reach into these folders.

* More English-capable `DefaultPluralizer`.
* Refactoring of internal utils files to put the interfaces in their own file
* Update packages to the last v5 versions.

<a id="1.0.0-beta.11"></a>

# 1.0.0-beta.11 (2018-04-29)

Add EntitySelectorFactory method overloads to simplify related-entity selector creation.
Clarify return types on EntitySelector interfaces
Add `EntityCacheSelector` which can be injected
Minor _break_ in signature of `EntitySelectorFactory$` constructor to use `EntityCacheSelector`
instead of `EntitySelectorFactory`

<a id="1.0.0-beta.10"></a>

# 1.0.0-beta.10 (2018-04-22)

Writing and testing related-entity selectors.

The **`related-entity-selectors.spec.ts`** demonstrates usage.

* feature: expose `selectors` in `EntityCollectionService<T>` and in `EntityCollectionServiceBase<T>`.
* feature: add `entitySelectors$Factory.createCollectionSelector`
* feature: `EntityCollectionServiceFactory` now an abstract interface-class, implemented with `DefaultEntityCollectionServiceFactory`.
* break: shuffled methods and pruned members that shouldn't be exposed.
* break: certain create functions are now members of factories.

<a id="1.0.0-beta.9"></a>

# 1.0.0-beta.9 (2018-04-14)

* refactor: Specified return type for `EntityActionFactory.create<P>`(`EntityAction<P>`);

* fix: `EntityDispatcher` must create actions with `EntityActionFactory` and only then run guard logic.
  This allows the developer to create an `EntityActionFactory` that can "correct" the payload
  before the guard passes judgement on it.

* break: `EntityDispatcher.dispatch` only takes an `EntityAction`.
  Call `EntityDispatcher.createAndDispatch` if you want to create the action and immediately dispatch it.

* break: `EntityActionGuard` completely overhauled. Will break the few who call it directly.

<a id="1.0.0-beta.8"></a>

# 1.0.0-beta.8 (2018-04-14)

* refactor: EntityCollectionReducer rewritten to delegate to `EntityCollectionReducerMethods`.

#### _EntityCollectionReducerMethods_

This makes it much easier to customize the reducer methods.
Formerly they were hidden within the `switch()`, which meant you had to effectively replace the
entire collection reducer if you wanted to change the behavior of a single action.

The default collection reducer methods are in the `EntityCollectionReducerMethods`.
This produces a map (`EntityCollectionReducerMethodsMap`) of `EntityOps` to entity collection reducer methods.

These methods rely on the `EntityCollectionReducerMethods` class members
that you can override.
Alternatively, you can replace any of them by name with your own method.
You could also add new "operations" and reducer methods to meet your custom needs.

You'll probably make such changes within a replacement implementation of the
`EntityCollectionReducerMethodsFactory`, an abstract class with _one_ simple method,
that is the injection token for a class that produces `EntityCollectionReducerMethods`.

<a id="1.0.0-beta.7"></a>

# 1.0.0-beta.7 (2018-04-13)

* feature: add missing dispatcher members for new actions from beta.4
* feature: add members to EntityCollectionService
* feature: add Logger, DefaultLogger and replace libraries `console` calls with it so that developer
  can handle/suppress libraries logging activity..
* refactor: `DataServiceError` no longer logs itself. Other services that create this error
  may call the new logger with the error
* tests: repair a few

<a id="1.0.0-beta.6"></a>

# 1.0.0-beta.6 (2018-04-12)

* refactor `DefaultDataService` to not use `pipe` static (gone in v6).
  Simplified it and deleted (internal) `make-response-delay.ts` in the process.

<a id="1.0.0-beta.5"></a>

# 1.0.0-beta.5 (2018-04-10)

**Breaking change (small)**

The `PersistenceResultHandler.handleError()` method result changed from a function returning an `Observable<EntityAction>`
to a function returning an `EntityAction<EntityActionDataServiceError>`.
This should affect very few people.

The change makes `handleError()` consistent with `handleSuccess()` which returned an `EntityAction` rather than an `Observable<EntityAction>`.
The motivation was to make it easier to write by-pass `EntityEffects` with your own HTTP calls
and still use the `EntityAction<EntityActionDataServiceError>` for result and error handling
that is the same as that in `EntityEffects`.

`EntityEffects` refactored to consume the revised `handleError()`.

Also refactored the `EntityCollectionReducer` to be a little smarter when setting flags.

<a id="1.0.0-beta.4"></a>

# 1.0.0-beta.4 (2018-04-09)

* Feature: add SET_LOADED and SET_LOADING entity ops
* RequestData.options is now optional

<a id="1.0.0-beta.3"></a>

# 1.0.0-beta.3 (2018-03-24)

* Feature: enable replacement of `EntityEffects` via `@ngrx/effects` backdoor;
  see `NgrxDataModule` and its new test.

<a id="1.0.0-beta.2"></a>

# release 1.0.0-beta.2 (2018-03-19)

Feature: add ability to preset entity `HttpResourceUrls` that are used by the `DefaultDataService`
(via `HttpUrlGenerator`) to construct the URLs for HTTP operations.

Extends `DefaultDataServiceConfig` so you can specify them.

For example, instead of setting the `PluralNames` for `Hero` you could fully specify the
singular and plural resource URLS in the `DefaultDataServiceConfig` like this:

```typescript
// store/entity-metadata.ts

// Not needed for data access when set Hero's HttpResourceUrls
// export const pluralNames = {
//   // Case matters. Match the case of the entity name.
//   Hero: 'Heroes'
// };

// entity-store.module.ts

const defaultDataServiceConfig: DefaultDataServiceConfig = {
  root: 'api', // default root path to the server's web api

  // Optionally specify resource URLS for HTTP calls
  entityHttpResourceUrls: {
    // Case matters. Match the case of the entity name.
    Hero: {
      // You must specify the root as part of the resource URL.
      entityResourceUrl: 'api/hero',
      collectionResourceUrl: 'api/heroes'
    }
  },
  ...
}
```

<a id="1.0.0-beta.1"></a>

# release 1.0.0-beta.1 (2018-03-14)

WAHOO! We're in beta!

<hr>

<a id="1.0.0-alpha.18"></a>

# release 1.0.0-alpha.18 (2018-03-14)

Fix error-logging bug in `EntityReducerFactory` (thanks Colin).

<a id="1.0.0-alpha.17"></a>

# release 1.0.0-alpha.17 (2018-03-13)

Remove circular refs within the library that caused `ng build --prod` to fail.

<a id="1.0.0-alpha.16"></a>

# release 1.0.0-alpha.16 (2018-03-10)

* Feature: EntitySelectors$.errors$ makes it easier to subscribe to entity action errors in a component.

<a id="1.0.0-alpha.15"></a>

# release 1.0.0-alpha.15 (2018-03-09)

* rename `EntitySelectors$.actions$` to `EntitySelectors$.entityActions$` so as not to confuse
  with `@ngrx/effects/Actions`.
  This is a **Breaking Change**, although we expect low impact because the feature only became viable today.

<a id="1.0.0-alpha.14"></a>

# release 1.0.0-alpha.14 (2018-03-09)

* Bug fix: `EntitySelectors$.actions$` now implemented (it was defined previously but not implemented).
* Bug fix: DefaultDataService adds delay on server errors too (see `makeResponseDelay`).
* Corrected text of the type constants for the QUERY_BY_KEY actions.

<a id="1.0.0-alpha.13"></a>

# release 1.0.0-alpha.13 (2018-03-07)

New Features:

* EntityCache-level actions, `MERGE_ENTITY_CACHE` and `SET_ENTITY_CACHE`, for
  offline and rollback scenarios.
  See "entity-reducer.md".

* `entityCache$` observable selector on `EntityCollectionService` and `EntitySelectors$Factory` enable watching of the entire cache.

<a id="1.0.0-alpha.12"></a>

# release 1.0.0-alpha.12 (2018-03-05)

* EntityEffects.persist is now public, mostly for easier testing

<a id="1.0.0-alpha.11"></a>

# release 1.0.0-alpha.11 (2018-03-05)

_Breaking change alert_
Renamed `EntityOp.SAVE_ADD` to `SAVE_ADD_ONE` for consistency.
No functional changes.

Small refactors for testability

* EntityEffects: expose `persistOps`
* EntityReducerFactory: new `getOrCreateReducer()` method.

<a id="1.0.0-alpha.10"></a>

# release 1.0.0-alpha.10 (2018-02-24)

_Breaking change alert!_

* Rename EntityOp enums and change their string values
* Change the generated EntityAction types by changing default formatter
* Source files moved into subdirectories and many source renamed

### Breaking Changes

The `EntityAction` changes are to better conform to "standards" seen in the wild.
They also guard against collisions with your custom entity action types

The file renaming and restructuring is for easier reading.
Shouldn't affect applications which do not deep link into the library.

<a id="1.0.0-alpha.9"></a>

# release 1.0.0-alpha.9 (2018-02-23)

* Can create a `EntityCollectionService<T>` with new `EntityCollectionServiceBase<T>()`
* Can create an `EntityDispatcher<T>` with new `EntityDispatcherBase()`.
* Refactored `EntityCollectionServiceFactory` and `EntityDispatcherFactory` to suit.
* Fixed `EntityCommands` interface for `isOptimistic` flag
* `EntityMetadataMap.entityName` no longer required because can determine `entityName` from the map's key.

Significant refactoring of `EntityCollectionService<T>` so can create write a class that
derives from `EntityCollectionServiceBase<T>` as in this example.

```
@Injectable()
export class HeroesService extends EntityCollectionServiceBase<Hero>{ ... }
```

See demo app's `HeroesService` and `VillainsService`.

`EntityCollectionServiceFactory.create<T>` still works.
It is useful for simple service creation
and when defining an entity service class with much smaller API service.

<a id="1.0.0-alpha.8"></a>

# release 1.0.0-alpha.8 (2018-02-19)

* renamed `EntityActions.filter` to `EntityActions.where`.
  Fixes conflict with `import 'rxjs/add/operator/filter';` #97 [minor breaking change]

<a id="1.0.0-alpha.7"></a>

# release 1.0.0-alpha.7 (2018-02-19)

* Support both optimistic and pessimistic save strategies
* New `EntityMetadata.entityDispatcherOptions` enables setting the strategy _per collection_.
* Add `EntityChangeTracker`
* `SAVE_UPDATE` processing calls _upsert_ so can do the equivalent of a `SAVE_UPSERT` by dispatching a `SAVE_UPDATE` with a new entity.
  Do this _only_ if your server supports upsert requests.
* `EntityCollection<T>` interface moved to `./interfaces.ts`
* `EntityDataServiceConfig` is now the `DefaultDataServiceConfig` and moved to `default-data.service.ts`
* `NgrxDataModule.forRoot` no longer takes an `EntityDataServiceConfig`. Instead you should provide the `DefaultDataServiceConfig` in your own module providers.

### Breaking Changes

* The transition from `EntityDataServiceConfig` to `DefaultDataServiceConfig` is
  a breaking change.
  See the ["_Introduction_"](https://github.com/johnpapa/angular-ngrx-data/blob/master/docs/introduction.md)
  document for an example.

* The previous save operations did not revert entities that failed to save.
  The next version will revert those entities after a save error.

<a id="1.0.0-alpha.6"></a>

# release 1.0.0-alpha.6 (2018-02-14)

* Add DefaultDataService error handling and their tests

<a id="1.0.0-alpha.5"></a>

# release 1.0.0-alpha.5 (2018-02-14)

* Workaround redux tools replay bug

<a id="1.0.0-alpha.4"></a>

# release 1.0.0-alpha.4 (2018-02-13)

* Upgrade to ngrx v5.1
* Angular peer dependencies as a range 4.1 < 6.0
* Support "upsert"
* Use "upsert" to implement QUERY_MANY effect [BREAKING CHANGE]

### Breaking Change

If you dispatch `QUERY_ONE` or `QUERY_MANY`,
you must upgrade _ngrx_ to v5.1 or later,
because the reducer uses the "upsert" feature, new in `@ngrx/entity` v5.1,
for `QUERY_ONE_SUCCESS` and `QUERY_MANY_SUCCESS`.

<a id="1.0.0-alpha.3"></a>

# 1.0.0-alpha.3 (2018-02-12)

* Added `EntityCollectionMetaReducer`s for easier customization of `EntityCollectionReducer` behavior.
* Documented entity reducers.

<a id="1.0.0-alpha.2"></a>

# 1.0.0-alpha.2 (2018-02-11)

Updated with more extension points

<a id="1.0.0-alpha.1"></a>

# 1.0.0-alpha.1 (2018-02-06)

Working release deployed to npm

<a id="1.0.0-alpha.0"></a>

# 1.0.0-alpha.0 (2018-02-04)

* Initial release
* Documentation is in progress
* See [repository-level readme](../README.md) for setup
