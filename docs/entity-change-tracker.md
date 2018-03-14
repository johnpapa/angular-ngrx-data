# EntityChangeTracker

Can add the current value of a cached entity in that entity's
`collection.originalValues` map and later _revert_ the entity to
this _original value_.

This feature is most valuable during _optimistic_ saves that
add, update, and delete entity data in the remote storage (e.g., a database).

## Change tracking and optimistic saves

The `EntityActions` whose operation names end in `_OPTIMISTIC` begin
an _optimistic_ save.
The default [`EntityCollectionReducer`](entity-reducer.md) _immediately_ updates the cached collection _before_ sending the HTTP request to do the same on the server.

The operation is _optimistic_ because it is presumed to succeed more often than not.
The _pessimistic_ versions of these actions _do not update_ the cached collection
_until_ the server responds.

### Save errors

If the server request timeouts or the server rejects the save request,
the _nrgx_ reducer is called with an error action ending in `_ERROR`.

**The reducer does nothing with save errors.**

There is no harm if the operation was _pessimistic_.
The collection had not been updated so there is no obvious inconsistency with the state
of the entity on the server.

It the operation was _optimistic_, the entity in the cached collection has been updated and is no longer
consistent with the entity's state on the server.
That may be a problem for your application.
You might prefer that the entity be restored to a known server state,
such as the state of the entity when it was last queried or successfully saved.

If the _ChangeTracker_ had captured that state in the `entityCollection.originalValues` _before_ the entity was changed in cache,
the app could tell the tracker to revert the entity to that state when it
sees an HTTP save error.

### ChangeTracker _MetaReducers_ 

The _ngrx-data_ library has optional [_MetaReducers_](entity-reducer.md#collection-meta-reducers)
that can track the entity state before an optimistic save and revert the entity
to it state when last queried or successfully saved.

These MetaReducers are included by default.

>You can remove or replace them during `NgrxDataModule` configuration.

_More on all of this soon_
