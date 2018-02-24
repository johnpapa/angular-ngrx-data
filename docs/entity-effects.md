# Entity Effects

**Work in Progress**

***Effects*** are a way to trigger _side effects_ with _actions_.

A one common, desirable _side effect_ is an asynchronous HTTP call to the remote server to fetch or save entity data.

You implement one or more _effects_ with the help of the [`@ngrx/effects` package](https://github.com/ngrx/platform/blob/master/docs/effects/README.md).

_Actions_ dispatched to the _ngrx store_ can be detected and processed by your _effect_ method.
After processing, whether synchronously or asynchronously, your method can dispatch new action(s) to the _store_

The _ngrx-data_ library implements an effect named `persist$` in its [`EntityEffects` class](../lib/src/effects/entity-effects.ts).

The `persist$` method filters for certain `EntityAction.op` values.
These values turn into HTTP GET, PUT, POST, and DELETE requests with entity data.
When the server responds (whether favorably or with an error), the `persist$` method dispatches new `EntityAction`s to the _store_ with the appropriate response data.

***More to come on this subject***
