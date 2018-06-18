# Angular ngrx-data library ChangeLog

<a id="6.0.2-beta.7"></a>

# 6.0.2-beta.7 (2018-06-20)

This release is primarily about the new, one-level _change tracking_ feature,
which makes _optimistic saves_ a viable choice (possibly the preferred choice),
now that you can recover from a save error by undoing (reverting).

This new feature provoked a cascade of changes, most of them related to change tracking,
and many of them are **breaking changes**.

## Features

### Change Tracking

EntityCollections, reducers, and selectors support change tracking and undo
via the rewritten `EntityChangeTracker` (`DefaultEntityChangeTracker`) and the
new `EntityCollection.changeState` property which replaces the `originalValues` property.

Previously change tracking and undo were an incomplete, alpha feature.

The ngrx-data now tracks changes properly by default and you can **_undo unsaved changes_**, reverting to the last know state of entity (or entities) on the server.
This gives the developer a good option for recovering from optimistic saves that failed.

Thanks to change tracking, we can tell when an entity that you're about to delete has been added locally but not saved to the server.
Ngrx-data now removes such entities immediately, even when the save is pessimistic, and silently side-steps the
HTTP DELETE request, which has nothing to remove on the server and might 404.

In order to tell `EntityEffects.persist$` to skip such deletes, we had to add a mutable **`EntityAction.skip`** flag to the `EntityAction` envelope.
The flag defaults to `false`.
Ngrx-data only sets it to true when the app tries to save the deletion of an added, unsaved entity.

We're not thrilled about adding another mutable property to `EntityAction`.
But we do not know of another way to tell `EntityEffects` to skip the HTTP DELETE request.

The new `EntityMetadata.noChangeTracking` flag, which is `false` by default,
can be set `true` in the metadata for a collection.
When `true`, ngrx-data does not track any changes for this collection
and the `EntityCollection.changeState` property remains an empty object.

You can also turnoff change tracking for a specific, cache-only action by choosing one of the
new "no-tracking" `EntityOps`.

See `entity-change-tracker.md` for discussion and details.

### Other Features

**_DefaultDispatcherOptions_ can be provided**
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

Now the collection defaults are in the `DefaultDispatcherOptions` service class, which is
provided in the `NgrxDataWithoutEffectsModule`.
Your app can provide an alternative to change these defaults.
For example, you could make all save operations optimistic by default.

```
@Injectable()
export class OptimisticDefaultDispatcherOptions {
  optimisticAdd = true;
  optimisticDelete = true;
  optimisticUpdate = true;
}

@NgModule({
  imports:   [ NgrxDataModule.forRoot({...}) ],
  providers: [
    { provide: DefaultDispatcherOptions, useClass: OptimisticDefaultDispatcherOptions },
    ...
  ]
})
export class EntityStoreModule {}
```

**Dispatcher query and save methods return Observables**

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

> Cache-only commands continue to return `void`.

Now you can subscribe to these observables to learn when the server request completed and
to examine the result or error.

```
heroService.add(newHero).subscribe(
  hero => ...,
  error => ...
);
```

Of course you can stay true to CQRS and ignore these results.
Your existing query and save callers will compile and work as before.

This feature does introduce a _breaking change_ for those apps that create custom entity collection services
and override the base methods.
These overrides must now return an appropriate terminating Observable.

_Implementation note_: ngrx-data associates the initiating action (e.g., `QUERY_ALL`) ngrx-data to the reply actions
(e.g,. `QUERY_ALL_SUCCESS` and `QUERY_ALL_ERROR` with a _correlation id_,
which it generates automatically.
Alternatively you can specify the `correlationId` as an option.

**Removed _OPTIMISTIC..._ EntityOps in favor of a flag (breaking change)**

The number of EntityOps and corresponding `EntityCollectionReducer` methods have been growing (see below).
Getting rid of the `OPTIMISTIC` ops is a welcome step in the other direction and makes reducer logic
a bit simpler.

You can still choose an optimistic save with the action payload's `isOptimistic` option.
The dispatcher defaults (see `DefaultDispatcherOptions`) have not changed.
If you don't specify `isOptimistic`, it defaults to `false` for _adds_ and _updates_ and `true` for _deletes_.

**`EntityAction` properties moved to the payload (breaking change)**

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

**New _QUERY_LOAD_ EntityOp**

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

**Added `SET_COLLECTION`** EntityOp to completely replace the collection.
Good for testing and rehydrating collection from local storage.
Dangerous. Use wisely and rarely.

**Added `EntityCacheAction.MERGE_QUERY_SET` (`MergeQuerySet(EntityQuerySet)`** merges query results
from multiple collections into the EntityCache using the `upsert` entity collection reducer method,
all at the same time.

This means that collection `selectors$` emit _after all collections have been updated_.
If you merged to each collection individually, the collection `selectors$` would emit
after each collection merge, which could provoke an unfortunate race condition
as when adding order line items before the parent order itself.

**_Guid utility functions and \_CorrelationIdGenerator_**

New utility functions, `getGuid()`, `getUuid()`, and `getGuidComb()` generate pseudo-GUID strings
for client-side id generation.
The `getGuidComb()` function produces sequential guids which are sortable and often nice to SQL databases.
All three produce 32-character hexadecimal UUID strings, not the 128-bit representation.

The `_CorrelationIdGenerator_` service `next()` method produces a string correlation id
consisting of 'CRID' plus an increasing integer.
Generated ids are unique only for a single browser session.
The entity dispatcher save and query methods call it to generate correlation ids that
associate a start action with its success or error action.
You can replace it by providing an alternative implementation.

**_DataServiceError_ extends from _Error_**

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
With change tracking enabled. ngrx-data no longer makes DELETE requests when processing SAVE_DELETE... actions
for entities that were added to the collection but not yet saved.

It is possible that an app or its tests expected ngrx-data to make these DELETE requests.

### Other Breaking Changes

**`EntityAction` properties moved to the payload**

As mentioned above. This change effects those who worked directly with `EntityAction` instances.

**`EntityAction.op` property renamed `entityOp`**

While moving entity action properties to ``EntityAction.payload`the`op`property became`entityOp` for three reasons.

1.  The rename reduces the likelihood that a non-EntityAction payload has a similarly named property that
    would cause ngrx-data to treat the action as an `EntityAction`.

1.  It should always have been called `entityOp` for consistency with its type as the value of the `EntityOp` enumeration.

1.  The timing is right because the relocation of properties to the payload is already a breaking change.

**Service dispatcher query and save methods must return an Observable**

This feature, described above, introduces a _breaking change_ for those apps that create custom entity collection services
and override the base methods.
These overrides must now return an appropriate terminating Observable.

**Renamed `EntityAction.label`**.

The word "label" is semantically too close to the word "type" in `Action.type` and easy to confuse with the type.
"Tag" conveys the freedom and flexibility we're looking for.
The EntityAction formatter will embed the "tag" in the type as it did the label.
We hope that relatively few are affected by this renaming.

More significantly, the tag (FKA label) is now part of the payload rather than a property of the action.

**`ADD_ALL` resets the loading (false) and loaded (true) flags**.

**Deleted `MERGE_ENTITY_CACHE`** as it has never been used and can be easily implemented with
`ENTITY_CACHE_SET` and a little code to get the current entity cache state.

**Moved `SET_ENTITY_CACHE` under `EntityCacheAction.SET_ENTITY_CACHE`**.

**Eliminated the `_OPTIMISTIC` variations of the save `EntityActions`** and their corresponding reducer methods.
Now add, update, and delete are handled by single save actions and their reducers behave pessimistically or
optimistically based on the `isOptimistic` flag in the `EntityActionOptions` in the action payload.
This change does not affect the primary application API and should break only those apps that delved below
the ngrx-data surface such as apps that implement their own entity action reducers.

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

The default collection reducer methods are in the `DefaultEntityCollectionReducerMethods`.
This produces a map of `EntityOps` to entity collection reducer methods.
These methods rely on the `DefaultEntityCollectionReducerMethods` class properties
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
