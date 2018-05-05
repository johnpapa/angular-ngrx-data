## Angular ngrx v6.0.0-beta.1 FAIL

Demonstrate inability to build a library that consumes @ngrx v6.0.0-beta.1 libraries

To see the problem, prepare by installing as follows.

```
git clone https://github.com/johnpapa/angular-ngrx-data.git ngrx-data-FAIL
cd ngrx-data-FAIL
git checkout ng-v6-FAIL
npm install
```

Now attempt to build the `ngrx-data` library

```bash
npm run build-lib
```

The build fails. The console says

```bash
BUILD ERROR
Error during template compile of 'NgrxDataModule'
  Function calls are not supported in decorators but 'StoreModule' was called.
  ...
```

Comment out the two ngrx imports in `NgrxDataModule` (leaving the `FooModule`) and try building again.
This time the build succeeds and generates a package in `dist`.

 Note that `FooModule` is just fine.
