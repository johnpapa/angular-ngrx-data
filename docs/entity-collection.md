# Entity Collection

The _ngrx-data_ library maintains a _cache_ (`EntityCache`) of
_entity collections_ for each _entity type_ in the _ngrx store_.

An _entity_collection_  implements the [`EntityCollection<T>` interface](../lib/src/reducers/entity-reducer.ts).

| Property   | Meaning                                  |
| ---------- |------------------------------------------|
| `ids`      | Primary key values in default sort order |
| `entities` | Map of primary key to entity data values |
| `filter`   | The user's filtering criteria            |
| `loaded`   | Whether collection was filled by QueryAll; forced false after clear |
| `loading`  | Whether currently waiting for query results to arrive from the server |
| `originalValues` | When [change-tracking](change-tracker.md) is enabled, the original values of unsaved entities |

You can extend an entity types with _additional properties_ via 
[entity metadata](entity-metadata.md#additional-collection-state).
