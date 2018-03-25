# Angular ngrx-data library ChangeLog

<a name="1.0.0-beta.3"></a>

# 1.0.0-beta.3 (2018-03-24)

* Feature: enable replacement of `EntityEffects` via `@ngrx/effects` backdoor;
  see `NgrxDataModule` and its new test.

<a name="1.0.0-beta.2"></a>

# release 1.0.0-beta.2 (2018-03-19)

Feature: add ability to preset entity `HttpResourceUrls` that are used by the `DefaultDataService`
(via `HttpUrlGenerator`) to construct the URLs for HTTP operations.

Extends `DefaultDataServiceConfig` so you can specify them.

For example, instead of setting the `PluralNames` for `Hero` you could fully specify the
singular and plural resource URLS in the `DefaultDataServiceConfig` like this:

```javascript
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

<a name="1.0.0-beta.1"></a>

# release 1.0.0-beta.1 (2018-03-14)

WAHOO! We're in beta!

<hr>

<a name="1.0.0-alpha.18"></a>

# release 1.0.0-alpha.18 (2018-03-14)

Fix error-logging bug in `EntityReducerFactory` (thanks Colin).

<a name="1.0.0-alpha.17"></a>

# release 1.0.0-alpha.17 (2018-03-13)

Remove circular refs within the library that caused `ng build --prod` to fail.

<a name="1.0.0-alpha.16"></a>

# release 1.0.0-alpha.16 (2018-03-10)

* Feature: EntitySelectors$.errors$ makes it easier to subscribe to entity action errors in a component.

<a name="1.0.0-alpha.15"></a>

# release 1.0.0-alpha.15 (2018-03-09)

* rename `EntitySelectors$.actions$` to `EntitySelectors$.entityActions$` so as not to confuse
  with `@ngrx/effects/Actions`.
  This is a **Breaking Change**, although we expect low impact because the feature only became viable today.

<a name="1.0.0-alpha.14"></a>

# release 1.0.0-alpha.14 (2018-03-09)

* Bug fix: `EntitySelectors$.actions$` now implemented (it was defined previously but not implemented).
* Bug fix: DefaultDataService adds delay on server errors too (see `makeResponseDelay`).
* Corrected text of the type constants for the QUERY_BY_KEY actions.

<a name="1.0.0-alpha.13"></a>

# release 1.0.0-alpha.13 (2018-03-07)

New Features:

* EntityCache-level actions, `MERGE_ENTITY_CACHE` and `SET_ENTITY_CACHE`, for
  offline and rollback scenarios.
  See "entity-reducer.md".

* `entityCache$` observable selector on `EntityService` and `EntitySelectors$Factory` enable watching of the entire cache.

<a name="1.0.0-alpha.12"></a>

# release 1.0.0-alpha.12 (2018-03-05)

* EntityEffects.persist is now public, mostly for easier testing

<a name="1.0.0-alpha.11"></a>

# release 1.0.0-alpha.11 (2018-03-05)

_Breaking change alert_
Renamed `EntityOp.SAVE_ADD` to `SAVE_ADD_ONE` for consistency.
No functional changes.

Small refactors for testability

* EntityEffects: expose `persistOps`
* EntityReducerFactory: new `getOrCreateReducer()` method.

<a name="1.0.0-alpha.10"></a>

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

<a name="1.0.0-alpha.9"></a>

# release 1.0.0-alpha.9 (2018-02-23)

* Can create a `EntityService<T>` with new `EntityServiceBase<T>()`
* Can create an `EntityDispatcher<T>` with new `EntityDispatcherBase()`.
* Refactored `EntityServiceFactory` and `EntityDispatcherFactory` to suit.
* Fixed `EntityCommands` interface for `isOptimistic` flag
* `EntityMetadataMap.entityName` no longer required because can determine `entityName` from the map's key.

Significant refactoring of `EntityService<T>` so can create write a class that
derives from `EntityServiceBase<T>` as in this example.

```
@Injectable()
export class HeroesService extends EntityServiceBase<Hero>{ ... }
```

See demo app's `HeroesService` and `VillainsService`.

`EntityServiceFactory.create<T>` still works.
It is useful for simple service creation
and when defining an entity service class with much smaller API service.

<a name="1.0.0-alpha.8"></a>

# release 1.0.0-alpha.8 (2018-02-19)

* renamed `EntityActions.filter` to `EntityActions.where`.
  Fixes conflict with `import 'rxjs/add/operator/filter';` #97 [minor breaking change]

<a name="1.0.0-alpha.7"></a>

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

<a name="1.0.0-alpha.6"></a>

# release 1.0.0-alpha.6 (2018-02-14)

* Add DefaultDataService error handling and their tests

<a name="1.0.0-alpha.5"></a>

# release 1.0.0-alpha.5 (2018-02-14)

* Workaround redux tools replay bug

<a name="1.0.0-alpha.4"></a>

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

<a name="1.0.0-alpha.3"></a>

# 1.0.0-alpha.3 (2018-02-12)

* Added `EntityCollectionMetaReducer`s for easier customization of `EntityCollectionReducer` behavior.
* Documented entity reducers.

<a name="1.0.0-alpha.2"></a>

# 1.0.0-alpha.2 (2018-02-11)

Updated with more extension points

<a name="1.0.0-alpha.1"></a>

# 1.0.0-alpha.1 (2018-02-06)

Working release deployed to npm

<a name="1.0.0-alpha.0"></a>

# 1.0.0-alpha.0 (2018-02-04)

* Initial release
* Documentation is in progress
* See [repository-level readme](../README.md) for setup
