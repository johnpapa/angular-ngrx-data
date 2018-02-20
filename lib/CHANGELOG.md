## Angular ngrx-data library ChangeLog

<a name="1.0.0-alpha.8"></a>
# release 1.0.0-alpha.7 (2018-02-19)
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
