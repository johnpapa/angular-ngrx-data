# Architecture overview

You describe your entity model to _ngrx-data_ in a few lines of [entity metadata](entity-metadata.md) and let the library do the rest of the work.

Your component injects an _ngrx-data_ **`EntityCollectionService`** and calls one or more of the standard set of command methods for dispatching actions.

Your component also subscribes to one or more of the service's `Observable` _selectors_ in order to reactively process and display entity state changes produced by those commands.

_Ngrx-data_ is really just ngrx under the hood. The data flows in typical ngrx fashion.
The following diagram illustrates the journey of a persistence `EntityAction`
such as `QUERY_ALL` for the `Hero` entity type.

![flow diagram](images/action-flow.png)

1.  The view/component calls [`EntityCollectionService.getAll()`](entity-services.md), which dispatches the hero's `QUERY_ALL` [EntityAction](entity-actions.md) to the store.

2.  NgRx kicks into gear ...

    1.  The _ngrx-data_ [EntityReducer](entity-reducer.md) reads the action's `entityName` property (`Hero` in this example) and forwards the action and existing entity collection state to the `EntityCollectionReducer` for heroes.

    1.  The collection reducer picks a switch-case based on the action's `op` (operation) property. That case processes the action and collection state into a new (updated) hero collection.

    1.  The store updates the _entity cache_ in the state tree with that updated collection.

    1.  _Ngrx_ observable selectors detect and report the changes (if any) to subscribers in the view.

3.  The original `EntityAction` then goes to the [EntityEffects](entity-effects.md).

4.  The effect selects an [EntityDataService](entity-dataservice.md) for that entity type. The data service sends an HTTP request to the server.

5.  The effect turns the HTTP response into a new _success_ action with heroes (or an _error_ action if the request failed).

6.  _Ngrx effects_ Dispatches that action to the store, which reiterates step #2 to update the collection with heroes and refresh the view.
