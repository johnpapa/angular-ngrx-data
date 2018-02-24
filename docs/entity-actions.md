# Entity Actions

The [`EntityService`](entity-service.md) dispatches an `EntityAction` to the _ngrx store_ when you call one of its commands to query or update entities in a cached collection.

### _Actions_

A vanilla
[_ngrx `Action`_](https://github.com/ngrx/platform/blob/master/docs/store/actions.md)
has a _type_ and an optional _payload_.

The _type_ is a string that uniquely identifies the action.
The _payload_ carries the data necessary to process the action.
The store sends actions to an _ngrx reducer_ which recognizes the action, extracts the payload, and performs some operation on some state in the store.

### _EntityActions_
An [`EntityAction`](../lib/src/actions/entity-action.ts) is a super-set of the _ngrx `Action`_.
It has two additional properties:
* `entityName` - the name of the entity type
* `op` - the name of an entity operation

The `op` name is member of the `EntityOp` enumeration.
Each `EntityOp` corresponds to one of (roughly) _twenty-six_ operations
that the _ngrx-data_ library can perform.

The `EntityActionFactory.create()` method creates an `Action` instance 
whose `type` is a string composed from the `entityName`
and the `op`.

For example, the default generated `Action.type` for the operation that queries the server for all heroes is `[Hero] ngrx-data/query-all`.

>Note that **_each entity type has its own _unique_ `Action` for each operation_**, as if you had created them individually by hand.

You _could_ write your own _reducers_ and _effects_ that select and respond to these constructed `Action.type`s.

The _ngrx-data_ library ignores them.
All library behaviors are determined by the `entityName` and `op` properties alone.

The [`EntityEffects`](../lib/src/effects/entity-effects.ts) decide which `Actions` to intercept based on the `EntityAction.op`.

The [`EntityReducer`](../lib/src/reducers/entity-reducer.ts) redirects the action to an `EntityCollectionReducer` based on the `entityName` and that reducer 
process the action based on the `op`.

>The `EntityActionFactory.create()` method calls the factory's `formatActionType()` method
to produce the `Action.type` string.
>Because _ngrx-data_ ignores the `type`, you can replace `formatActionType()` with your own method if you prefer a different format
or provide and inject your own `EntityActionFactory`.

### Where are the _EntityActions_?

In an _ngrx-data_ app, the _ngrx-data_ library creates and dispatches _EntityActions_ for you.

_EntityActions_ are largely invisible when you call the [`EntityService`](entity-service.md) API. 
You can see them in action with the
[ngrx store dev-tools](https://github.com/ngrx/platform/tree/master/docs/store-devtools).

## Why this matters

In an ordinary _ngrx_ application, you hand-code every `Action` for every _state_ in the store 
as well as the [reducers](https://github.com/ngrx/platform/blob/master/docs/store/actions.md#action-reducers) 
that process those _actions_.

It takes many _actions_, a complex _reducer_, and the help of the [@ngrx/effects](https://github.com/ngrx/platform/blob/master/docs/effects/README.md) package to manage queries and saves for a _single_ entity type.

The [@ngrx/entity](https://github.com/ngrx/platform/blob/master/docs/entity/README.md) package makes the job considerably easier.

>The _ngrx-data_ library internally delegates much of the heavy lifting to _@ngrx/entity_. 

But you must still write a lot of code for each entity type.
You're expected to create _eight actions_ per entity type and 
write a _reducer_ that responds to these eight actions by calling eight methods of an [@ngrx/entity _EntityAdapter_](https://github.com/ngrx/platform/blob/master/docs/entity/adapter.md#adapter-collection-methods).

These artifacts only address the _cached_ entity collection. 

You may write as many as _eighteen additional actions_ to support a typical complement of asynchronous CRUD (Create, Retrieve, Update, Delete) operations. You'll have to dispatch them to the store where you'll process them with more _reducer_ methods and _effects_ that you must also hand code.

With vanilla _ngrx_, you'll go through this exercise for _every entity type_.
That's a lot of code to write, test, and maintain.

With the help of _ngrx-data_, you don't write any of it.
_Ngrx-data_ creates the _actions_ and the _dispatchers_, _reducers_, and _effects_ that respond to those actions.
