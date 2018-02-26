## Angular ngrx-data repository Changelog

The ngrx-data library has its own [CHANGELOG.md](lib/CHANGELOG.md) and versioning scheme in `/lib`.
Please look there.

**_This_** Changelog covers changes to the repository and the demo applications.
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
- Changed _ngrx-data_ paths in `tsconfig.app.json` and `tsconfig.spec.json`
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
- Moved library CHANGELOG.md to the `../lib` folder
- Upgrade to ngrx v.5.1

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
