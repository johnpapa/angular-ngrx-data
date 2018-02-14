## Angular ngrx-data library ChangeLog

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
