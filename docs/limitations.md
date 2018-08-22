# Ngrx-data Limitations

The _ngrx-data_ library lacks many capabilities of a [full-featured entity management](#alternatives) system.

You may be able to work-around some of the limitations without too much effort,
particularly when the shortcomings are a problem for just a few entity types.

This page lists many of the serious limitations we've recognized ourselves.

If curing them were easy, we'd have done so already.
Sometimes there are acceptable, well-known solutions that just take a little more effort.
Some solutions are too complicated or perform poorly.
In some cases, we have no good ideas at all.

If there's enough interest in this _ngrx-data_, we'd like to tackle some of these problems.
We could use your help.

## Deep entity cloning

This library (like the [@ngrx/entity library](https://github.com/ngrx/platform/tree/master/docs/entity)
on which it depends) assumes that entity property values
are simple data types such as strings, numbers, and dates.

Nothing enforces that assumption.
Many web APIs return entity data with complex properties.
A property value could be a _value type_ (e.g., a _money type_ that combines a currency indicator and an amount).
It could have a nested structure (e.g., an address).

This library shallow-clones the entity data in the collections.
It doesn't clone complex, nested, or array properties.
You'll have to do the deep equality tests and cloning yourself _before_ asking _ngrx-data_ to save data.

## Non-normalized server responses

Many query APIs return an entity bundle with data for many different entity types.

This library only handles responses with a single entity or an array of entities of the same type.
When you adopt the _redux_ pattern, you're expected to "normalize" the entity data
as you would a _relational database_.

This library lacks the tools to help you disaggregate and normalize server response data.

## Entity relationships and navigation

Entities are often related to each other via _foreign keys_.
These relationships can be represented as a directed graph, often with cycles.

This library tacitly assumes that entities of different types are unrelated.
It is completely unaware of _relationships_ and _foreign keys_ that may be implicit in the entity data.
It's up to you to make something out of those relationships and keys.

It's not easy to represent relationships.

A `Customer` entity could have a one-to-many relationship with `Order` entities.
The `Order` entity has an `order.customer` property whose value is the primary key
of its parent `Customer`.

Each `Order` has related `LineItems`.
A `LineItems` has a one-to-one relationship with `Product`.
And so it goes.

There are other cardinalities to consider (one-to-zero, one-to-zero-or-many, many-to-many, etc.).
A good solution would include an extension of the `EntityMetadata` that identified relationships, their cardinalities, and their foreign keys.

It can be convenient to construct classes for `Customer` and `Order` that have
properties for navigating between them (_navigation properties_).
The domain logic for the model may argue for unidirectional navigations in some cases
and bi-directional navigations in others.

We have to be prepared for any load order.
The _orders_ could arrive before their parent _customers_.
A good solution would tolerate that, making connections and breaking them again
as entities enter and leave the cache.

There will be long chains of navigations (`Customer <-> Order <-> <-> LineItem <-> Product <-> Supplier`).
How should these be implemented?
_Observable selector_ properties seem logical but thorny performance traps
await.

## Client-side primary key generation

You are responsible for setting the primary key of an entity you create.

If the server supplies the key, you can send the new entity to the server
and rely on the server to send the entity back with its assigned key.
It's up to you to orchestrate that cycle.

It's far better if the client assigns the key.
You can create new records offline or recover if your connection to the server
breaks inconveniently during the save.

It's easy to generate a new _guid_ (or _uuid_) key.
It's much harder to generate integer or semantic keys because
you need a foolproof way to enforce uniqueness.

Server-supplied keys greatly complicate maintenance of a cache of inter-related entities.
You'll have to find a way to hold the related entities together until you can save them.

Temporary-key generation is one approach. It requires complex key-fixup logic
to replace the temporary keys in _foreign key properties_
with the server-supplied permanent keys.

## Transactions

Many web APIs require you to save a bundle of entities together in a single transaction.

For example, you may have to create or update an _order_ with all of its _line items_ in a single request representing a single transaction.

The library doesn't support that yet.

## Data integrity rules

Entities are often governed by intra- and inter-entity validation rules.
The `Customer.name` property may be required.
The `Order.shipDate` must be after the `Order.orderDate`.
The parent `Order` of a `LineItem` may have to exist.

You can weave validation rules into your application logic
but you'll have to do so without the help of the `ngrx-data` library.

It would be great if the library knew about the rules (in `EntityMetadata`?), ran the validation rules at appropriate times, displayed validation errors on screen, and prevented the save of entities with errors.

These might be features in a future version of this library.

<a name="serialization"></a>

## Server/client entity mapping

The representation of an entity on the server may be different than on the client.

Perhaps the camelCased property names on the client-side entity are PascalCased on the server.
Maybe a server-side property is spelled differently than on the client.
Maybe the client entity should have some properties that don't belong on the server entity (or vice-versa).

Today you could transform the data in both directions with [`HttpClient` interceptors](https://angular.io/guide/http#intercepting-requests-and-responses).
But this seems like a problem that would be more easily and transparently addressed as a feature of `ngrx-data`.

## Entity change-state

The library assumes that the entities in the cached entity collection are (or at least _were_) also entities on the server.

You don't change the `Customer` name and put the updated entity in the cache. You save the updated customer entity to the server and, if the server responds with its approval, _then_ you update the cache.

But maybe you can't connect to the server.
Where do you keep the user's pending, unsaved changes?

One approach is to keep track of pending changes, either in a change-tracker or in the entity data themselves.
Then you might be able to use one of the
[_cache-only_ commands](../lib/src/dispatchers/entity-commands.ts) to
put hold the entity in cache while you waited for restored connectivity.

There is no such facility in the library today.

## No batch save operations

You can add, update, or delete several entities at a time _from cache_.

But you can only save-add, save-update, or save-delete a single entity at a time to the server.

There is no standard web API for saving multiple entity changes.

If your web API supports such operations,
you might follow the _ngrx-data_ patterns
while adding your own entity actions and _ngrx effects_ for these operations.

## No explicit _SAVE_UPSERT_

The default `EntityEffects` supports saving a new or existing entity but does not have an explicit
SAVE*UPSERT action that would \_official* save
an entity which might be either new or existing.

You may be able to add a new entity with `SAVE_UPDATE` or `SAVE_UPDATE_ONE_OPTIMISTIC`,
because the `EntityCollectionReducer` implements these actions
by calling the collection `upsertOne()` method.

Do this _only_ if your server supports _upsert-with-PUT_ requests.

## No request concurrency checking

The user saves a new `Customer`, followed by a query for all customers.
Is the new customer in the query response?

`Ngrx-data` does not coordinate save and query requests and does not guarantee order of responses.

You'll have to manage that yourself.
Here's some pseudo-code that might do that for the previous example:

```javascript
// add new customer, then query all customers
customerService
  .addEntity(newCustomer)
  .pipe(concatMap(() => customerService.queryAll()))
  .subscribe(custs => (this.customers = custs));
```

The same reasoning applies to _any_ request that must follow in a precise sequence.

## No update concurrency checking

There is no intrinsic mechanism to enforce concurrency checks when updating a record even if the record contains a concurrency property.

For example, the user saves a change to the customer's address from "123 Main Street" to "45 Elm Avenue".
Then the user changes and saves the address again to "89 Bower Road".
Another user changes the same address to "67 Maiden Lane".

What's the actual address in the database? What's the address in the user's cache?

It could be any of the three addresses depending on when the server saw them and when the responses arrived.
You cannot know.

Many applications maintain a concurrency property that guards against updating an entity
that was updated by someone else.
The `ngrx-data` library is unaware of this protocol.
You'll have to manage concurrency yourself.

## No offline capability

_Ngrx-data_ lacks support for accumulating changes while the application is offline and then saving those changes to the server when connectivity is restored.

The _ngrx_ system has some of the ingredients of an offline capability.
Actions are immutable and serializable so they can be stashed in browser storage of some kind while offline and replayed later.

But there are far more difficult problems to overcome than just recording changes for playback.
_Ngrx-data_ makes no attempt to address these problems.

## Query language

Servers often offer a sophisticated query API for selecting entities from the server, sorting them on the server, grabbing related entities at the same time, and reducing the number of downloaded fields.

This library's `getWithQuery()` command takes a query specification in the form of a _parameter/value_ map or a URL query string.

There is no apparatus for composing queries or sending them to the server except as a query string.

<a id="alternatives"></a>

## An alternative to _ngrx-data_

[BreezeJS](http://www.getbreezenow.com/breezejs) is a free, open source,
full-featured entity management library that overcomes (almost) all of the
limitations described above.
Many Angular (and AngularJS) applications use _Breeze_ today.

It's not the library for you if you **_require_** a small library that adheres to _reactive_, _immutable_, _redux-like_ principles.

> Disclosure: one of the _ngrx-data_ authors, Ward Bell,
> is an original core Breeze contributor.
