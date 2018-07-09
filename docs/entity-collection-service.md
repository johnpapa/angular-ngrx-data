# EntityCollectionService

An **[`EntityCollectionService<T>`](../lib/src/entity-services/entity-collection-service.ts)**
is a facade over the _ngrx-data_ **dispatcher** and **selectors$** that manages an entity `T` collection cached in the _ngrx store_.

The **_Dispatcher_** features **command** methods that dispatch [_entity actions_](entity-actions.md) to the _ngrx store_.
These commands either update the entity collection directly or trigger HTTP requests to a server. When the server responds, the _ngrx-data_ library dispatches new actions with the response data and these actions update the entity collection.

The [`EntityCommands`](../lib/src/dispatchers/entity-commands.ts) interface lists all the commands and what they do.

Your application calls these _command methods_ to update
the _cached entity collection_ in the _ngrx store_.

**_Selectors$_** are properties returning _selector observables_.
Each _observable_ watches for a specific change in the cached entity collection and emits the changed value.

The [`EntitySelectors$`](../lib/src/selectors/entity-selectors$.ts) interface
lists all of the pre-defined _selector observable properties_ and
explains which collection properties they observe.

Your application subscribes to _selector observables_
in order to process and display entities in the collection.

## Examples from the demo app

Here are simplified excerpts from the demo app's `HeroesComponent` showing the component calling _command methods_ and subscribing to _selector observables_.

```javascript
constructor(EntityCollectionServiceFactory: EntityCollectionServiceFactory) {
  this.heroService = EntityCollectionServiceFactory.create<Hero>('Hero');
  this.filteredHeroes$ = this.heroService.filteredEntities$;
  this.loading$ = this.heroService.loading$;
}

getHeroes() { this.heroService.getAll(); }
add(hero: Hero) { this.heroService.add(hero); }
deleteHero(hero: Hero) { this.heroService.delete(hero.id); }
update(hero: Hero) { this.heroService.update(hero); }
```

### Create the _EntityCollectionService_ with a factory

The component injects the _ngrx-data_ `EntityCollectionServiceFactory` and
creates an `EntityCollectionService` for `Hero` entities.

> We'll go inside the factory [later in this guide](#entity-collection-service-factory).

### Create the _EntityCollectionService_ as a class

Alternatively, you could have created a single `HeroEntityService` elsewhere, perhaps in the `AppModule`, and injected it into the component's constructor.

There are two basic ways to create the service class.

1.  Derive from `EntityCollectionServiceBase<T>`
1.  Write a `HeroEntityService` with just the API you need.

When `HeroEntityService` derives from `EntityCollectionServiceBase<T>` it must inject the `EntityCollectionServiceFactory` into its constructor.
There are examples of this approach in the demo app.

When defining an `HeroEntityService` with a limited API,
you may also inject `EntityCollectionServiceFactory` as a source of the
functionality that you choose to expose.

Let your preferred style and app needs determine which creation technique you choose.

### Set component _selector$_ properties

The component sets two of its properties to two of the `EntityCollectionService` _selector observables_: `filteredEntities$` and `loading$`.

The `filteredEntities$` _observable_ produces an array of the currently cached `Hero` entities that satisfy the user's filter criteria.
This _observable_ produces a new array of heroes if the user
changes the filter or if some action changes the heroes in the cached collection.

The `loading$` _observable_ produces `true` while the
[data service](entity-dataservice.md) is waiting for heroes from the server.
It produces `false` when the server responds.
The demo app subscribes to `loading$` so that it can turn a visual loading indicator on and off.

Note that these component and `EntityCollectionService` selector property names end in `'$'`, a common convention for a property that returns an `Observable`.

All _selector observable_ properties of an `EntityCollectionService` follow this convention.
For brevity, we'll refer to them going forward as _`selector$` properties_ or _`selectors$`_.

> Note that these _`selector$`_ properties (with an `'s'`) differ from the closely-related `selector` properties (no `'$'` suffix),
> discussed elsewhere.
>
> A `selector` property returns a _function_ that selects from the entity collection.
> That function is an ingredient in the production of values for its corresponding `selector$` property.

The component _class_ does not subscribe these `selector$` properties but the component _template_ does.

The template binds to them and forwards their _observables_ to the Angular `AsyncPipe`, which subscribes to them.
Here's an excerpt of the `filteredHeroes$` binding.

```html
<div *ngIf="filteredHeroes$ | async as heroes">
...
</div>
```

### Call _command methods_

Most of the `HeroesComponent` methods delegate to `EntityCollectionService` command methods such as `getAll()` and `add()`.

There are two kinds of commands:

1.  Commands that trigger requests to the server.
1.  Cache-only commands that update the cached entity collection.

The server commands are simple verbs like "add" and "getAll".  
They dispatch actions that trigger asynchronous requests to a remote server.

The cache-only command methods are longer verbs like "addManyToCache" and "removeOneFromCache"
and their names all contain the word "cache".
They update the cached collection immediately (synchronously).

> Most applications call the server commands because they want to query and save entity data.
>
> Apps rarely call the cache-only commands because direct updates to the entity collection
> are lost when the application shuts down.

Many `EntityCollectionService` command methods take a value.
The value is _typed_ (often as `Hero`) so you won't make a mistake by passing in the wrong kind of value.

Internally, an entity service method creates an
[_entity action_](entity-actions.md) that corresponds to the method's intent. The action's _payload_ is either the value passed to the method or an appropriate derivative of that value.

_Immutability_ is a core principle of the _redux pattern_.
Several of the command methods take an entity argument such as a `Hero`.
An entity argument **must never be a cached entity object**.
It can be a _copy_ of a cached entity object and it often is.
The demo application always calls these command methods with copies of the entity data.

> The current _ngrx_ libraries do not guard against mutation of the objects (or arrays of objects) in the store.
> A future _ngrx_ **_freeze_** feature will provide such a guard in _development_ builds.

All _command methods_ return `void`.
A core principle of the _redux pattern_ is that _commands_ never return a value. They just _do things_ that have side-effects.

Rather than expect a result from the command,
you subscribe to a _selector$_ property that reflects
the effects of the command. If the command did something you care about, a _selector$_ property should be able to tell you about it.

<a id="entity-collection-service-factory"></a>

## _EntityServiceFactory_

The `create<T>()` method of the _ngrx-data_ [`EntityCollectionServiceFactory`](../lib/src/entity-services/entity-services.ts) produces a new instance of the `EntityCollectionServiceBase<T>` class that implements the `EntityCollectionService` interface for the entity type `T`.
