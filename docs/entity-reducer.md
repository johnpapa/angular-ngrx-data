# Entity Reducer

The _Entity Reducer_ is the _master reducer_ for all entity collections in the stored entity cache.

<a id="reducer-factory"></a>

The library doesn't have a named _entity reducer_ type.
Rather it relies on the **`EntityReducerFactory.create()`** method to produce that reducer,
which is an _ngrx_ `ActionReducer<EntityCache, EntityAction>`.

Such a reducer function takes an `EntityCache` state and an `EntityAction` action
and returns an `EntityCache` state.

The reducer responds either to an [EntityCache-level action](#entity-cache-actions) (rare)
or to an `EntityAction` targeting an entity collection (the usual case).
All other kinds of `Action` are ignored and the reducer simply returns the given `state`.

> The reducer filters specifically for the action's `entityType` property.
> It treats any action with an `entityType` property as an `EntityAction`.

The _entity reducer's_ primary job is to

* extract the `EntityCollection` for the action's entity type from the `state`.
* create a new, [initialized entity collection](#initialize) if necessary.
* get or create the `EntityCollectionReducer` for that entity type.
* call the _entity collection reducer_ with the collection and the action.
* replace the _entity collection_ in the `EntityCache` with the new collection returned by the _entity collection reducer_.

## _EntityCollectionReducers_

An `EntityCollectionReducer` applies _actions_ to an `EntityCollection` in the `EntityCache` held in the _ngrx store_.

There is always a reducer for a given entity type.
The `EntityReducerFactory` maintains a registry of them.
If it can't find a reducer for the entity type, it [creates one](#collection-reducer-factory), with the help
of the injected `EntityCollectionReducerFactory`, and registers that reducer
so it can use it again next time.

<a id="register"></a>

### Register custom reducers

You can create a custom reducer for an entity type and
register it directly with `EntityReducerFactory.registerReducer()`.

You can register several custom reducers at the same time
by calling `EntityReducerFactory.registerReducer(reducerMap)` where
the `reducerMap` is a hash of reducers, keyed by _entity-type-name_.

<a id="collection-reducer-factory"></a>

## Default _EntityCollectionReducer_

The [`EntityCollectionReducerFactory`](../lib/src/reducers/entity-collection-reducer.ts)
creates a default reducer that leverages the capabilities of the `@ngrx/entity/EntityAdapter`,
guided by the app's [_entity metadata_](entity-metadata.md).

The default reducer decides what to do based on the `EntityAction.op` property,whose string value it expects will be a member of the
[`EntityOp` enum](../lib/src/actions/entity-op.ts).

Many of the `EntityOp` values are ignored; the reducer simply returns the
_entity collection_ as given.

Certain persistence-oriented ops, for example,
are meant to be handled by the _ngrx-data_ [`persist$` effect](entity-effects.md).
They don't update the collection data (other than, perhaps, to flip the `loading` flag).

Others add, update, and remove entities from the collection.

> Remember that _immutable objects_ are a core principle of the _redux/ngrx_ pattern.
> These reducers don't actually change the original collection or any of the objects in it.
> They make a copy of the collection and only update copies of the objects within the collection.

See the [@ngrx/entity/EntityAdapter collection methods](https://github.com/ngrx/platform/blob/master/docs/entity/adapter.md#adapter-collection-methods) for a basic guide to the
cache altering operations performed by the default _entity collection reducer_.

The [`EntityCollectionReducerFactory`](../lib/src/reducers/entity-collection-reducer.ts) and its tests are the authority on how the default reducer actually works.

<a id='initialize'></a>

## Initializing collection state

The `NgrxDataModule` adds an empty `EntityCache` to the _ngrx-data_ store.
There are no collections in this cache.

If the master _entity reducer_ can't find a collection for the _action_'s entity type,
it creates a new, initialized collection with the help of the
[`EntityCollectionCreator`](../lib/src/reducers/entity-collection-creator.ts), which was
injected into the `EntityReducerFactory`.

The _creator_ returns an initialized collection from the `initialState` in the entity's
[`EntityDefinition`](../lib/src/entity-metadata/entity-definition.ts).
If the entity type doesn't have a _definition_ or the definition doesn't have an `initialState` property value,
the creator returns an `EntityCollection`.

The _entity reducer_ then passes the new collection in the `state` argument of the _entity collection reducer_.

<a id="customizing"></a>

## Customizing entity reducer behavior

You can _replace_ any entity collection reducer by [registering a custom alternative](#register).

You can _replace_ the default _entity reducer_ by
providing a custom alternative to the [`EntityCollectionReducerFactory`](#collection-reducer-factory).

You could even _replace_ the master _entity reducer_ by
providing a custom alternative to the [`EntityReducerFactory`](#reducer-factory).

But quite often you'd like to extend a _collection reducer_ with some additional reducer logic that runs before or after.

<a name="entity-cache-actions"></a>

## EntityCache-level actions

A few actions target the entity cache as a whole.

`SET_ENTITY_CACHE` replaces the entire cache with the object in the action payload,
effectively re-initializing the entity cache to a known state.

`MERGE_ENTITY_CACHE` replaces specific entity collections in the current entity cache
with those collections present in the action payload.
It leaves the other current collections alone.

> See `entity-reducer.spec.ts` for examples of these actions.

These actions might be part of your plan to support offline scenarios or rollback changes to many collections at the same time.

For example, you could subscribe to the `EntityServices.entityCache$` selector.
When the cache changes, you could
serialize the cache to browser local storage.
You might want to _debounce_ for a few seconds to reduce churn.

Later, when relaunching the application, you could dispatch the `SET_ENTITY_CACHE` action to initialize the entity-cache even while disconnected.
Or you could dispatch the `MERGE_ENTITY_CACHE` to rollback selected collections to a known state as
in error-recovery or "what-if" scenarios.

> **Important**: `MERGE_ENTITY_CACHE` _replaces_ the currently cached collections with the entity collections in its payload.
> It does not _merge_ the payload collection entities into the existing collections as the name might imply.
> May reconsider and do that in the future.

If you want to create and reduce additional, cache-wide actions,
consider the _EntityCache MetaReducer_, described in the next section.

<a id='meta-reducers'></a>

## _MetaReducers_

The `ngrx/store` supports [**MetaReducers**](https://github.com/ngrx/platform/blob/master/docs/store/api.md#meta-reducers) that can inspect and process actions flowing through the store and potentially change state in the store.

A _MetaReducer_ is a function that takes a reducer and returns a reducer.
Ngrx composes these reducers with other reducers in a chain of responsibility.

Ngrx calls the reducer returned by a MetaReducer just as it does any reducer.
It calls it with a _state_ object and an _action_.

The MetaReducer can do what it wants with the state and action.
It can log the action, handle the action on its own, delegate to the incoming reducer, post-process the updated state, or all of the above.

> Remember that the actions themselves are immutable. Do not change the action!

Like every reducer, the state passed to a MetaReducer's reducer is only
the section of the store that is within the reducer's scope.

Ngrx-data supports two levels of MetaReducer

1.  _EntityCache MetaReducer_, scoped to the entire entity cache
1.  _EntityCollection MetaReducer_, scoped to a particular collection.

<a id='cache-meta-reducers'></a>

### Entity Cache _MetaReducers_

The **EntityCache MetaReducer** helps you inspect and apply actions that affect the _entire entity cache_.
You might add custom actions and an _EntityCache MetaReducer_ to update several collections at the
same time.

An _EntityCache MetaReducer_ reducer must satisfy three requirements:

1.  always returns the entire entity cache.
1.  return synchronously (no waiting for server responses).
1.  never mutate the original action; clone it to change it.

> We intend to explain how in a documentation update.
> For now, see the `ngrx-data.module.spec.ts` for examples.

<a id='collection-meta-reducers'></a>

### Entity Collection _MetaReducers_

An **entity collection _MetaReducer_** takes an _entity collection reducer_ as its reducer argument and
returns a new _entity collection reducer_.

The new reducer receives the `EntityCollection` and `EntityAction` arguments that would have gone to the original reducer.

It can do what it wants with those arguments, such as:

* log the action,
* transform the action into a different action (for the same entity collection),
* call the original reducer,
* post-process the results from original reducer.

The new entity collection reducer must satisfy three requirements:

1.  always returns an `EntityCollection` for the same entity.
1.  return synchronously (no waiting for server responses).
1.  never mutate the original action; clone it to change it.

#### Compared to @ngrx/store/MetaReducers

While the _entity collection MetaReducer_ is modeled on the `@ngrx/store/MetaReducer` ("_store MetaReducer_"), it is crucially different in several respects.

The _store MetaReducer_ broadly targets _store reducers_.
It wraps _store reducers_, sees _all actions_, and can update _any state within its scope_.

But a _store MetaReducer_ neither see nor wrap an _entity collection reducer_.
These _entity collection reducers_ are internal to the _EntityCache Reducer_ that is registered with the _ngrx-data_ feature.

An _entity collection MetaReducer_ is narrowly focused on manipulation of a single, target _entity collection_.
It wraps _all entity collection reducers_.

Note that it can't can't access other collections,the _entity cache_, or any other state in the store.
If you need a cross-collection, _MetaReducer_, try the [EntityCache MetaReducer](#cache-meta-reducer)
described above.

#### Provide Entity _MetaReducers_ to the factory

Create one or more _entity collection MetaReducers_ and
add them to an array.

Provide this array with the `ENTITY_COLLECTION_META_REDUCERS` injection token
where you import the `NgrxDataModule`.

The `EntityReducerFactory` injects it and composes the
array of _MetaReducers_ into a single _meta-MetaReducer_.
The earlier _MetaReducers_ wrap the later ones in the array.

When the factory register an `EntityCollectionReducer`, including the reducers it creates,
it wraps that reducer in the _meta-MetaReducer_ before
adding it to its registry.

All `EntityActions` dispatched to the store pass through this wrapper on their way in and out of the entity-specific reducers.

> We intend to explain how to create and provide _entity collection MetaReducers_ in a documentation update.
> For now, see the `entity-reducer.spec.ts` for examples.
