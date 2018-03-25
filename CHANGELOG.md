## Angular ngrx-data repository Changelog

The ngrx-data library has its own [CHANGELOG.md](lib/CHANGELOG.md) and versioning scheme in `/lib`.
Please look there.

**_This_** Changelog covers changes to the repository and the demo applications.
<a name="0.2.12"></a>

# 0.2.12 (2018-03-25)

* Fix: add missing trailing slash on Hero resource urls (update and delete were broken).
* Add comment to `HttpResourceUrls` interface about need for trailing slash (but don't cut new lib release for this).
* Opted not to force trailing slash because as contrary to the goal of putting dev
  in complete control of url generation. May re-evaluate that decision later.

<a name="0.2.11"></a>

# 0.2.11 (2018-03-19)

* demonstrates `HttpResourceUrls` setting in config (new in beta.2)

<a name="0.2.10"></a>

# 0.2.10 (2018-03-15)

* Update ngPackagr from -rc to v.2.2

<a name="0.2.9"></a>

# 0.2.9 (2018-03-14)

* Added the e2e tests from ngrx-data-lab
* Modified sample to support fast behavior under e2e
* Added a root level tsconfig.json so IDE understands the e2e tests.

None of these changes should break anything or interfere with creating the library package.

<a name="0.2.8"></a>

# 0.2.8 (2018-03-12)

* Update app to align with app in ngrx-data-lab (much cleaner)

<a name="0.2.7"></a>

# 0.2.7 (2018-03-09)

Added `VillainEditor` to demonstrate routing to a detail component
(e.g., `/villains/21`) which tries to get the entity from cache but, if it can't find it,
attempts a `EntityService.getByKey()`.

This `VillainEditor` also shows

* creating a `villain$` that combines the parameter id observable with the `entityMap$` selector
  so can find the villain for the routed `id`.
* the `villain$` has the side-effect of dispatching `QUERY_BY_KEY` if no cached villain for that id.
* creating `error$` to watch for `QUERY_BY_KEY_ERROR` when the request fails (try `/villains/1`)
* creating a `loading$` observable that combines the `error$` with `$villain`

Depends on alpha.14

<a name="0.2.6"></a>

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

<a name="0.2.5"></a>

# 0.2.5 (2018-03-05)

Add HeroesComponent tests to illustrate how one might write test components. Experimental.

Requires Alpha.11

<a name="0.2.4"></a>

# 0.2.4 (2018-02-26)

App refactors based on learnings from our Angular Awesome workshop.

<a name="0.2.3"></a>

# 0.2.3 (2018-02-24)

Adapt to alpha.10

<a name="0.2.2"></a>

# 0.2.2 (2018-02-23)

Revises the demo app and updates the docs to conform to alpha.9

* Adds `HeroesService` and `VillainsService`
* Updates the `EntityMetadata`
* Adds `HeroesV1Component` to illustrate using `EntityServiceFactory` directly w/o `HeroService`.

<a name="0.2.1"></a>

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

<a name="0.2.0"></a>

# 0.2.0 (2018-02-13)

* Moved library CHANGELOG.md to the `../lib` folder
* Upgrade to ngrx v.5.1

### Breaking Change

If you dispatch `QUERY_ONE` or `QUERY_MANY`,
you must upgrade _ngrx_ to v5.1 or later,
because the reducer uses the "upsert" feature, new in `@ngrx/entity` v5.1,
for `QUERY_ONE_SUCCESS` and `QUERY_MANY_SUCCESS`.

<a name="0.1.0"></a>

# 0.1.0 (2018-02-04)

* Initial release
* Documentation is in progress
* See readme for setup
