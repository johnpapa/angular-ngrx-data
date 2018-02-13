## Angular ngrx-data repository Changelog

The ngrx-data library has its own [CHANGELOG.md](lib/CHANGELOG.md) and versioning scheme in `/lib`.
Please look there.

**_This_** Changelog covers changes to the repository and the demo applications.

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
