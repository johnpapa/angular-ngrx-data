## Angular ngrx-data repository Changelog

The ngrx-data library has its own [CHANGELOG.md](lib/CHANGELOG.md) and versioning scheme in `/lib`.
Please look there.

**_This_** Changelog covers changes to the repository and the demo applications.

<a id="0.6.3">
# 0.6.3 (2018-09-18)

* Added "Delete All Villains" to demonstrate the multi-entity save feature introduced in ngrx-data v6.1.0.

<a id="0.6.2">
# 0.6.2 (2018-06-26)

* Significantly refactored for ngrx-data `6.0.2-beta.7`.

<a id="0.6.1">
# 0.6.1 (2018-05-25)

* Refactored for EntityAction operators as required by Beta 6
* Add example of extending EntityDataServices with custom `HeroDataService` as described in `entity-dataservice.md` (#151).

<a id="0.6.0"></a>

# 0.6.0 (2018-05-08)

The sample application and README now reflect
the `6.0.0` version of ngrx-data, which relies on the v6 versions
of Angular, RxJS, and ngrx.

Also every symbol with "EntityService" in the name has been renamed with "EntityCollectionService".
See the library's own [CHANGELOG.md](lib/CHANGELOG.md/#6.0.0-beta.2) for details.

These are **breaking changes**.

This version also favors the use of the new `EntityServices` for creating
entity collection services rather than the `EntityCollectionServiceFactory`,
which still works.

<hr>

<a id="0.2.13"></a>

# 0.2.13 (2018-05-04)

* modified app to provide app-specific Pluralizer and Logger to prove that works.
  These versions merely inherit from the ngrx-data versions, making no changes.

* ngrx-data paths in all `tsconfig.json` point to `dist/ngrx-data` instead of `lib/src`, on Filipe Silva' recommendation.
  This means that the app points to the result of the library build, not the library source
  and `npm run build-all` does a production build against the library output just as an app
  would build against the installed npm packages.

The downside is that "Go to definition" takes you to the `d.ts` file rather than library source file.
That's inconvenient. But the benefit is that the routine build process reflects what apps will experience.
This is the approach followed by the Angular CLI's library support.

<a id="0.2.12"></a>

# 0.2.12 (2018-03-25)

* Fix: add missing trailing slash on Hero resource urls (update and delete were broken).
* Add comment to `HttpResourceUrls` interface about need for trailing slash (but don't cut new lib release for this).
* Opted not to force trailing slash because as contrary to the goal of putting dev
  in complete control of url generation. May re-evaluate that decision later.

<a id="0.2.11"></a>

# 0.2.11 (2018-03-19)

* demonstrates `HttpResourceUrls` setting in config (new in beta.2)

<a id="0.2.10"></a>

# 0.2.10 (2018-03-15)

* Update ngPackagr from -rc to v.2.2

<a id="0.2.9"></a>

# 0.2.9 (2018-03-14)

* Added the e2e tests from ngrx-data-lab
* Modified sample to support fast behavior under e2e
* Added a root level tsconfig.json so IDE understands the e2e tests.

None of these changes should break anything or interfere with creating the library package.

<a id="0.2.8"></a>

# 0.2.8 (2018-03-12)

* Update app to align with app in ngrx-data-lab (much cleaner)

<a id="0.2.7"></a>

# 0.2.7 (2018-03-09)

Added `VillainEditor` to demonstrate routing to a detail component
(e.g., `/villains/21`) which tries to get the entity from cache but, if it can't find it,
attempts a `EntityCollectionService.getByKey()`.

This `VillainEditor` also shows

* creating a `villain$` that combines the parameter id observable with the `entityMap$` selector
  so can find the villain for the routed `id`.
* the `villain$` has the side-effect of dispatching `QUERY_BY_KEY` if no cached villain for that id.
* creating `error$` to watch for `QUERY_BY_KEY_ERROR` when the request fails (try `/villains/1`)
* creating a `loading$` observable that combines the `error$` with `$villain`

Depends on alpha.14

<a id="0.2.6"></a>

# 0.2.6 (2018-03-05)

Depends on alpha.12

More `HeroesComponent` tests

* Now demonstrates `HeroesService` test double
* Tests from 0.2.5 are in `heroes.component.effects.spec.ts`.

Sample revised

* HeroesService and Villains service no longer `getAll()` when the datasource (local/remote) changes.
* Instead they expose a `getAllOnDataSourceChange` observable that runs `getAll()` and caches the result
  when the datasource changes IF a component subscribes.
* HeroesComponent and VillainsComponent subscribe to `getAllOnDataSourceChange`
* Those components now start with the cached version of the `getAll()` results.
  Press refresh or toggle the datasource to trigger a new `getAll()`

<a id="0.2.5"></a>

# 0.2.5 (2018-03-05)

Add HeroesComponent tests to illustrate how one might write test components. Experimental.

Requires Alpha.11

<a id="0.2.4"></a>

# 0.2.4 (2018-02-26)

App refactors based on learnings from our Angular Awesome workshop.

<a id="0.2.3"></a>

# 0.2.3 (2018-02-24)

Adapt to alpha.10

<a id="0.2.2"></a>

# 0.2.2 (2018-02-23)

Revises the demo app and updates the docs to conform to alpha.9

* Adds `HeroesService` and `VillainsService`
* Updates the `EntityMetadata`
* Adds `HeroesV1Component` to illustrate using `EntityCollectionServiceFactory` directly w/o `HeroService`.

<a id="0.2.1"></a>

# 0.2.1 (2018-02-19)

* Changed _ngrx-data_ paths in `tsconfig.app.json` and `tsconfig.spec.json`
  to point to `"../../lib/src"` instead of `"../../dist/ngrx-data"`.

  This enables debugging and rebuilding of the app when you change an ngrx-data library
  file while running `ng serve`.
  Without that change, could only debug into the consolidated, build `ngrx-data.js` file
  (no `.ts`!) and had to re-run `npm run build-lib` to get lib changes to propagate.

  You still see TWO files in the debugger for each source file, both claiming to be from `.ts`.
  The one you want always ends `../lib/src/file-name.ts`.

  Do not know if this change affects a production build of the demo app.
  Don't think we care.

  Should not affect the builds of the _ngrx-data lib packages_!

<a id="0.2.0"></a>

# 0.2.0 (2018-02-13)

* Moved library CHANGELOG.md to the `../lib` folder
* Upgrade to ngrx v.5.1

### Breaking Change

If you dispatch `QUERY_ONE` or `QUERY_MANY`,
you must upgrade _ngrx_ to v5.1 or later,
because the reducer uses the "upsert" feature, new in `@ngrx/entity` v5.1,
for `QUERY_ONE_SUCCESS` and `QUERY_MANY_SUCCESS`.

<a id="0.1.0"></a>

# 0.1.0 (2018-02-04)

* Initial release
* Documentation is in progress
* See readme for setup
