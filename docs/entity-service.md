# Entity Services

An **`EntityService<T>`** is a facade over the _ngrx-data_ **commands** and **queries** that manage an entity collection cached in the _ngrx store.

_Commands_ dispatch [_entity actions_](entity-actions.md) to the _ngrx store_ that either update the entity collection directly or trigger HTTP requests to a server. When the server responds, the _ngrx-data_ library dispatches new actions with the response data and these actions update the entity collection.

_Queries_ are properties returning _selector observables_. Each _observable_ watches for a specific change in the entity collection and emits the changed value.

Your application calls `EntityService<T>` _command methods_ to update the collection and subscribes _selector observables_ in order to process and display entities in the collection.

## Examples from the demo app

Here are simplified excerpts from the demo app's `HeroesComponent` showing the component calling _command methods_ and subscribing to _selector observables_.

```javascript
constructor(entityServiceFactory: EntityServiceFactory) {
  this.heroService = entityServiceFactory.create<Hero>('Hero');
  this.filteredHeroes$ = this.heroService.filteredEntities$;
  this.loading$ = this.heroService.loading$;
}

getHeroes() { this.heroService.getAll(); }
add(hero: Hero) { this.heroService.add(hero); }
deleteHero(hero: Hero) { this.heroService.delete(hero.id); }
update(hero: Hero) { this.heroService.update(hero); }
``` 

### Create the _EntityService_ with a factory

The component injects the _ngrx-data_ `EntityServiceFactory` and
creates an `EntityService` for `Hero` entities.
 
>We'll go inside the factory [later in this guide](#entity-service-factory).

Alternatively, we could have created a single `HeroEntityService` elsewhere, perhaps in the `AppModule`, and injected it into the component's constructor.
That's the app designer's choice.

### Set _selector$_ properties

The component sets two of its properties to two of the `EntityService` _selector observables_: `filteredEntities$` and `loading$`.

Note that these property names end in `'$'`, a common convention to indicate that a property that returns an `Observable`.

All _selector observable_ properties of an `EntityService` follow this convention.
For brevity going forward, we'll refer to them as _`selector$` properties_ or _`selectors$`_.

>Note that these `selector$` properties differ from the closely-related `selector` properties (no `'$'` suffix),
>discussed elsewhere.
>A `selector` property returns a _function_ that selects from the entity collection.
>That function is an ingredient in the production of values for its corresponding `selector$` property.

### Call _command methods_

Component methods delegate to the `EntityService` command methods such as `getAll()` and `add()`.

Many of these methods take a value.
The value is _typed_ so you won't make a mistake by passing in the wrong kind of value.

Internally, the entity service method creates the
[_entity action_](entity-actions.md) that corresponds to the service method's intent. The action's _payload_ is either the value passed to the service method or an appropriate derivative of that value.

_Immutability_ is a core principle of the _redux pattern_.
Several of the command methods take an entity argument such as a `Hero`.
An entity argument **must never be a cached entity object**.
It can be a _copy_ of a cached entity object and often is. 
The demo application always calls these command methods with copies of the entity data.

>The current _ngrx_ libraries do not guard against mutation of the objects (or arrays of objects) in the store.
>A future _ngrx_ **_freeze_** feature will provide such a guard in _development_ builds.


All _command methods_ return `void`. 
A core principle of the _redux pattern_ is that _commands_ never return a value. They just _do things_.

Rather than expect a result from the command,
you subscribe to a _selector$_ property that reflects
the effects of the command. If the command did something you care about, a _selector$_ property should be able to tell you about it.

<a name="entity-service-factory"></a>
## _EntityServiceFactory_

The `create<T>()` method of the _ngrx-data_ [`EntityServiceFactory`](../lib/src/entity-service) produces a new object that implements the `EntityService` interface for the entity type `T`. 
