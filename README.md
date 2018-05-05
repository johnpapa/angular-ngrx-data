## Angular ngrx-data FAIL

Demonstrate inability to build a library with @ngrx v6.0.0-beta.1 libraries

To see the problem, attempt to build the `ngrx-data` library

```bash
npm run build-lib
```

The build fails. The console says

```bash
BUILD ERROR
Error during template compile of 'NgrxDataModule'
  Function calls are not supported in decorators but 'StoreModule' was called.
```
