## Publish to npm

Only a few of us are authorized to publish the npm package.
Here is our checklist.

1. Confirm that the library builds cleanly and that the demo app can use it in production with `npm run build-all`

1. Run `ng tests`. All tests should pass.

1. Bump the npm package version number in `lib/package.json`.

1. Run `npm run build-publish`. This command builds the library one more time before publishing to npm.

1. Commit the `lib/package.json` version change.

The publish step will fail if you aren't authorized to publish.

The publish step will fail if you forgot to bump the version in which case, bump the version, and try the publish step again. Remember to commit the version change.