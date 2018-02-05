# Entity Metadata

The _ngrx-data_ library maintains a **_cache_ **of entity data in the _ngrx store_. The properties of that cache are collections of entities.

You tell the _ngrx-data_ library how to structure and maintain that cache with **_entity metadata_**.

The entities within a collection belong to the same **_entity type_**.
Each _entity type_ appears as named instance of the _ngrx-data_ [**`EntityMetadata<T>`**](#entity-metadata-interface) interface in an `EntityMetadataMap`.

Here is an example from the demo app that defines metadata for two entities, `Hero` and `Villain`.

```javascript
export const entityMetadata: EntityMetadataMap = {
  Hero: {
    entityName: 'Hero',
    selectId,
    sortComparer: sortByName,
    filterFn: nameFilter
  },
  Villain: {
    entityName: 'Villain',
    filterFn: nameAndSayingFilter
  }
};
```

>TODO: explain how to tell ngrx-data about this
## Register metadata

The easy way to register metadata is to define one `EntityMetadataMap` for the entire application and specify it in the one place where you initialize the _ngrx-data_ library:

```javascript
    NgrxDataModule.forRoot({
      ...
      entityMetadata: entityMetadata,
      ...
    })
```

If you define your _entity model_ in several separate Angular modules (perhaps lazy loaded), you can incrementally add metadata with the multi-provider.

```javascript
{ provide: ENTITY_METADATA_TOKEN, multi: true, useValue: someEntityMetadata }
```

<a name="entity-metadata-interface"></a>
## Metadata Properties

The `EntityMedata<T>` interface describes aspects of an entity type that tell the _ngrx-data_ library how to manage collections of entity data of type `T`. 

Type `T` is your application's TypeScript representation of that entity; it can be an interface or a class.

### _entityName_

The `entityName` of the type is the only **required metadata property**. 

The `entityName` is the _key_ of the entity type's metadata in the `EntityMetadataMap`. 

The `entityName` must be unique within the `EntityMetadataMap`. The name is typically a PascalCased, singular noun like "Hero". 

The spelling of the `entityName` is important for _ngrx-data_ conventions. It appears in the generated [_entity actions_](docs/entity-actions), in error messages, and in the persistence operations.

Importantly, the default [_entity dataservice_](docs/entity-dataservice.md) creates HTTP resource names (URLs) from the lowercase version of this name. For example, if the entity type `entityName` is "Hero", the default data service will POST to a URL such as ``some/api/base/hero``.

>It will also fetch all hero items by sending a GET to the URL `'some/api/base/heros'` because it adds an `'s'` to the end of the lowercase entity name. 
>
>The proper plural of "hero" is "hero*es*", not "heros". You'll see how to fix that [below](#plurals).

<a name=filterfn></a>
### _filterFn_

Many applications allow the user to filter a cached entity collection. 

In the accompanying demonstration app, the user can filter _heroes_ by name and can filter _villains_ by name or the villain's _saying_.

We felt this common scenario is worth building into the _ngrx-data_ library. So every entity can have an _optional_ filter function.

Each collection's `filteredEntities` selector applies the filter function to the collection, based on the user's filtering criteria, which are held in the the stored entity collection's  `filter` property.

If there is no filter function, the `filteredEntities` selector is the same as the `selectAll` selector, which returns all entities in the collection.

A filter function (see [`EntityFilterFn<T>`](../lib/src/entity-filters.ts)) takes an entity collection and the user's filtering criteria (the filter _pattern_) and returns an array of the selected entities.

The _ngrx-data_ library includes a helper function, `PropsFilterFnFactory<T>`, that creates an entity filter function which will treat the user's input as a regular expression  and apply it to one or more properties of the entity.

The demo uses this helper to create hero and villain filters. Here's how the app creates the a `nameAndSayingFilter` function for villains.

```javascript
export function nameAndSayingFilter<T>(entities: T[], pattern: string) {
  return PropsFilter<any>(['name', 'saying'])(entities, pattern);
}
```

<a name=selectid></a>
### _selectId_

Every _entity type_ must have a _primary key_ whose value is an integer or a string.

The _ngrx-data_ library assumes that the entity has an `id` property whose value is the primary key.

Not every entity will have a primary key property named `id`. For some entities, the primary key could be the combined value of two or more properties.

In these cases, you specify a `selectId` function that, given an entity instance, returns an integer or string primary key value.

In the [entity reducer tests](../lib/src/entity.reducer.spec.ts), the `Villain` type has a string primary key property named `key`.
The `selectorId` function is this:

```javascript
selectId: (villain: Villain) => villain.key
```

<a name=sortcomparer></a>
### _sortComparer_

The _ngrx-data_ library keeps the collection entities in a specific order.

>This is actually a feature of the underlying `@ngrx/entity` library.

The default order is the order in which the entities arrive from the server.
The entities you add are pushed to the end of the collection.

You may prefer to maintain the collection in some other order.
When you provide a `sortComparer` function, the _ngrx-lib_ keeps the collection in the order prescribed by your comparer.

In the demo app, the villains metadata has no comparer so its entities are in default order.

The hero metadata have a `sortByName` comparer that keeps the collection in alphabetical order by `name`.

```javascript
export function sortByName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name);
}
```
Run the demo app and try changing existing hero names or adding new heroes. 

Your app can call the `selectKey` selector to see the collection's `ids` property, which returns an array of the collection's primary key values in sorted order.

<a name=additionalcollectionstate></a>
### _additionalCollectionState_

Each _ngrx-data_ entity collection in the the store has these predefined properties.
| Property        | Meaning |
| ------------- |-------------|
| `ids`| Primary key values in default sort order |
| `entities` | Map of primary key to entity data values|
| `filter` | The user's filtering criteria |
| `loading` | Whether ngr-data is waiting for entity data to arrive from the server |

You can add your own collection properties by setting the `additionalCollectionState` property to an object with those custom collection properties.

The [entity selectors tests](../lib/src/entity.selectors.spec.ts) illustrate by adding `foo` and `bar` collection properties to test hero metadata.

```javascript
  additionalCollectionState: {
    foo: 'Foo',
    bar: 3.14
  }
```

The property values become the initial collection values for those properties when _ngrx-data_ first creates the collection in the store.

The _ngrx-data_ library generates selectors for these properties but has no way to update them. You'll have to create or extend the existing reducers to do that yourself.

<a name="plurals"></a>
## Pluralizing the entity name

The _ngrx-data_ [`DefaultDataService`](docs/entity-dataservice.md) relies on the `HttpUrlGenerator` to create conventional HTTP resource names (URLs) for each entity type.

By convention, an HTTP request targeting a single entity item contains the lowercase, singular version of the entity type name. For example, if the entity type `entityName` is "Hero", the default data service will POST to a URL such as `'some/api/base/hero'`.

By convention, an HTTP request targeting multiple entities contains the lowercase, _plural_ version of the entity type name. The URL of a GET request that retrieved all heroes would be something like `'some/api/base/heroes'`.

The `HttpUrlGenerator` can't pluralize the entity type name on its own. It delegates to an injected _pluralizing class_, called `Pluralizer`.

The `Pluralizer` class has a _pluralize()_ method that takes the singular string and returns the plural string.

The _ngrx-data_ library's default `Pluralizer` implementation simply appends an `'s'`. That's fine for the `Villain` type (which becomes "villains"). But that's the wrong technique for pluralizing the `Hero` type (which becomes "heros").

This default `Pluralizer` also injects an object (with the `PLURAL_NAMES_TOKEN`) which is a map of singular to plural strings.

The `pluralize()` method looks for the singular entity name in that map and uses the corresponding plural value if found. Otherwise, it returns the entity name plus `'s'`.

If this scheme works for you, you create a map of _singular-to-plural_ entity names for the exceptional cases, as the demo app does:

```javascript
export const pluralNames = {
  // Case matters. Match the case of the entity name.
  Hero: 'Heroes'
};
```

Then specify this map while configuring the _ngrx-data_ library.

```javascript
    NgrxDataModule.forRoot({
      ...
      pluralNames: pluralNames
    })
```

If you define your _entity model_ in separate Angular modules (perhaps lazy loaded), you can incrementally add a plural names map with the multi-provider.

```javascript
{ provide: PLURAL_NAMES_TOKEN, multi: true, useValue: morePluralNames }
```
