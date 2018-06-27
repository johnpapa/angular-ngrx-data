## Publish to npm

Only a few of us are authorized to publish the npm package.
Here is our checklist.

1.  Run `npm run build-all` to confirm that the library builds cleanly and that the demo app can use it in production.

1.  Run `lite-server --baseDir="dist/app"`to smoke-test the production app. It runs the prod app in port 3000.

1.  Run `ng lint`. Should be clean.

1.  Run `ng test`. All unit tests should pass.

1.  Run `npm run e2e`. All e2e tests should pass.

1.  Bump the npm package version number in `lib/package.json`.

1.  Run `npm run build-publish`. This command builds the library one more time and then publishes to npm.

> The publish step will fail if you aren't authorized to publish.
>
> The publish step will fail if you forgot to bump the version in which case, bump the version, and try the publish step again. Remember to commit the version change.

5.  Commit the `lib/package.json` version change.

6.  [Add release (and tag) in github](https://github.com/johnpapa/angular-ngrx-data/releases)
