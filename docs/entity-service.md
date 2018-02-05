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

The `filteredEntities$` _observable_ produces an array of the currently cached `Hero` entities that satisfy the user's filter criteria.
This _observable_ produces a new array of heroes if the user
changes the filter or if some action changes the heroes in the cached collection.

The `loading$` _observable_ produces `true` when the 
[data service](entity-dataservice.md) is querying for heroes.
It produces `false` when the service responds.
The demo app subscribes to `loading$` so that it can turn a visual loading indicator on and off.

Note that these component and `EntityService` selector property names end in `'$'`, a common convention for a property that returns an `Observable`.

All _selector observable_ properties of an `EntityService` follow this convention.
For brevity, we'll refer to them going forward as _`selector$` properties_ or _`selectors$`_.

>Note that these _`selector$`_ properties (with an `'s'`) differ from the closely-related `selector` properties (no `'$'` suffix),
>discussed elsewhere.
>
>A `selector` property returns a _function_ that selects from the entity collection.
>That function is an ingredient in the production of values for its corresponding `selector$` property.

The component _class_ does not subscribe these `selector$` properties but the component _template_ does.

The template binds to them and forwards their _observables_ to the Angular `AsyncPipe`, which subscribes to them.
Here's an excerpt of the `filteredHeroes$` binding.

```html
<div *ngIf="filteredHeroes$ | async as heroes">
...
</div>
```

### Call _command methods_

Most of the `HeroesComponent` methods delegate to `EntityService` command methods such as `getAll()` and `add()`.

There are two kinds of commands:

1. Commands that trigger HTTP requests.
1. Commands that update the cached entity collection.

The

Many `EntityService` command methods take a value.
The value is _typed_ (often as `Hero`) so you won't make a mistake by passing in the wrong kind of value.

Internally, an entity service method creates an
[_entity action_](entity-actions.md) that corresponds to the method's intent. The action's _payload_ is either the value passed to the method or an appropriate derivative of that value.

_Immutability_ is a core principle of the _redux pattern_.
Several of the command methods take an entity argument such as a `Hero`.
An entity argument **must never be a cached entity object**.
It can be a _copy_ of a cached entity object and it often is. 
The demo application always calls these command methods with copies of the entity data.

>The current _ngrx_ libraries do not guard against mutation of the objects (or arrays of objects) in the store.
>A future _ngrx_ **_freeze_** feature will provide such a guard in _development_ builds.


All _command methods_ return `void`. 
A core principle of the _redux pattern_ is that _commands_ never return a value. They just _do things_ that have side-effects.

Rather than expect a result from the command,
you subscribe to a _selector$_ property that reflects
the effects of the command. If the command did something you care about, a _selector$_ property should be able to tell you about it.

<a name="entity-service-factory"></a>
## _EntityServiceFactory_

The `create<T>()` method of the _ngrx-data_ [`EntityServiceFactory`](../lib/src/entity-service) produces a new object that implements the `EntityService` interface for the entity type `T`. 
