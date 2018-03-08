# Entity Actions

The [`EntityService`](entity-service.md) dispatches an `EntityAction` to the _ngrx store_ when you call one of its commands to query or update entities in a cached collection.

## _Action_ and _EntityAction_

A vanilla
[_ngrx `Action`_](https://github.com/ngrx/platform/blob/master/docs/store/actions.md) is a message. 
The message describes an operation that can change state in the _store_.

The _action_'s `type` identifies the operation.
It's optional `payload` carries the message data necessary to perform the operation.

An [`EntityAction`](../lib/src/actions/entity-action.ts) is a super-set of the _ngrx `Action`_.
It has additional properties that guide _ngrx-data_'s handling of the action.  Here's the full interface.

```
export interface EntityAction<P = any> extends Action {
  readonly type: string;
  readonly entityName: string;
  readonly op: EntityOp;
  readonly payload?: P;
  error?: Error;
}
```

* `type` - action name, typically generated from the `entityName` and the `op`
* `entityName` - the name of the entity type
* `op` - the name of an entity operation
* `payload?` - the message data for the action.
* `error?` - an unexpected action processing error.


The `type` is the only property required by _ngrx_. It is a string that uniquely identifies the action among the set of all the types of actions that can be dispatched to the store.

_Ngrx-data_ doesn't care about the `type`. It pays attention to the `entityName` and `op` properties.

The `entityName` is the name of the entity type. 
It identifies the _entity collection_ in the _ngrx-data_ cache to which this action applies. 
This name corresponds to [_ngrx-data metadata_](entity-metadata.md) for that collection.
An entity interface or class name, such as `'Hero'`, is a typical `entityName`.

The `op` identifies the operation to perform on the _entity collection_. _Ngrx-data_ recognizes names in the [`EntityOp` enumeration](../lib/src/actions/entity-op.ts).
Each of these `EntityOp` names corresponds to one of almost _forty_ operations
that the _ngrx-data_ library can perform.

The `payload` is conceptually the body of the message.
Its type and content should fit the requirements of the operation to be performed.

The `error` property indicates that something went wrong while processing the action. [See more below](#action-error).

## _EntityAction_ consumers

The _ngrx-data_ library ignores the `Action.type`.
All _ngrx-data_ library behaviors are determined by the `entityName` and `op` properties alone.

The _ngrx-data_ [`EntityReducer`](../lib/src/reducers/entity-reducer.ts) redirects an action to an `EntityCollectionReducer` based on the `entityName` 
and that reducer processes the action based on the `op`.

The [`EntityEffects`](../lib/src/effects/entity-effects.ts) intercepts an action if its `op` is among the small set of persistence `EntityAction.op` names.
The effect picks the right _data service_ for that action's `entityName`, then tells the service to make the appropriate HTTP request and handle the response.


## Creating an _EntityAction_

You can create an `EntityAction` by hand if you wish.
The _ngrx-data_ library considers _any action_ with an `entityName` and  `op` properties to be an `EntityAction`.

The `EntityActionFactory.create()` method helps you create a consistently well-formed `EntityAction` instance 
whose `type` is a string composed from the `entityName` and the `op`.

For example, the default generated `Action.type` for the operation that queries the server for all heroes is `'[Hero] ngrx-data/query-all'`.

>The `EntityActionFactory.create()` method calls the factory's `formatActionType()` method
to produce the `Action.type` string.
>
>Because _ngrx-data_ ignores the `type`, you can replace `formatActionType()` with your own method if you prefer a different format
or provide and inject your own `EntityActionFactory`.

Note that **_each entity type has its own _unique_ `Action` for each operation_**, as if you had created them individually by hand.

## Where are the _EntityActions_?

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


<a name="action-error"></a>
## _EntityAction.error_

The presence of an `EntityAction.error` property indicates that something bad happened while processing the action.

An `EntityAction` should be immutable. The `EntityAction.error` property is the _only_ exception and is strictly an internal property of the _ngrx-data_ system.
You should rarely (if ever) set it yourself.

The primary use case for `error` is to catch reducer exceptions.
_Ngrx_ stops subscribing to reducers if one of them throws an exception.
Catching reducer exceptions allows the application to continue operating.

_Ngrx-data_ traps an error thrown by an `EntityCollectionReducer` and sets the `EntityAction.error` property to the caught error object.

The `error` property is important when the errant action is a _persistence action_ (such as `SAVE_ADD_ONE`).
The `EntityEffects` will see that such an action has an error and will return the corresponding failure action (`SAVE_ADD_ONE_ERROR`) immediately, without attempting an HTTP request.

>This is the only way we've found to prevent a bad action from getting through the effect and triggering an HTTP request.

<a name="entity-cache-actions"></a>
## EntityCache-level actions

A few actions target the entity cache as a whole.

`SET_ENTITY_CACHE` replaces the entire cache with the object in the action payload,
effectively re-initializing the entity cache to a known state.

`MERGE_ENTITY_CACHE` replaces specific entity collections in the current entity cache
with those collections present in the action payload.
It leaves the other current collections alone.

Learn about them in the "[EntityReducer](entity-reducer.md#entity-cache-actions)" document.
