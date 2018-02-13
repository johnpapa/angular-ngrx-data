# Extension Points

**Work in progress**

The `ngrx-data` library strives for the "_it just works_" experience.
But customizations are an inevitable necessity.

The `ngrx-data` library invites you to customize its behavior at many points,
most of them listed here.

## Provide alternatives

The `ngrx-data` library consists of many services that perform small tasks.

Look at the many providers in `ngrx-data.module.ts`.
Provide your own version of any `ngrx-data` service, as long as it conforms to the service API and implements the expected behavior.

Be sure to test your alternatives.

## Custom _EntityService_

## Extend the _EntityCollection_

## Custom _EntityActions_

### Rename the generated entity action _type_ 

The `EntityActionFactory.create()` method relies on the `formatActionType()` method to
produce the `Action.type` string. 

The default implementation concatenates the `EntityOp` with the name of the entity type.
For example, querying all heroes results in the entity type, `QUERY_ALL [Hero]`.

If you don't like that approach you can replace the `formatActionType()` method with a generator that produces action type names that are more to your liking.
The ngrx-data library doesn't make decisions based on the `Action.type`.

## Custom _effects_

The _ngrx-data_ library has one ngrx `@Effect`, the `EntityEffects` class.

This class detects entity persistence actions, performs the persistence operation with a
call to an `EntityDataService` and channels the HTTP response through a 
`PersistenceResultHandler` which produces a persistence results observable that
goes back to the ngrx store. 

The `EntityEffects` class intercepts actions that have an `op` property whose
value is one of the `persistOps`. Other actions are ignored by this effect.

It tries to process any action with such an `op` property by looking for a

### Choose data service for the type

The [_Entity DataService_](guide/entity-dataservice.md) describes the 
default service, how to provide a data service for a specific entity type
or replace the default service entirely.

### Replace the generic-type effects

### Handle effect for a specific type

### Replace handling of the results of a data service call

### Replace the EntityEffects entirely

## Custom _Reducers_

The [_Entity Reducer_ guide](guide/entity-reducer.md#customizing) explains how to
customize entity reducers.

## Custom data service

### Replace the generic-type data service

### Replace the data service for a specific type

## Custom HTTP resource URLs

### Add plurals

### Replace the Pluralizer

### Replace the HttpUrlGenerator

## Serialization with back-end

The shape of the JSON data going over the wire to-and-from the server often
doesn't match the shape of the entity model(s) in the client application.
You may need _serialization/deserialization_ transformation functions 
to map between the client entity data and the formats expected by the web APIs.

There are no facilities for this within `ngrx-data` itself although
that is a [limitation](guide/limitations.md#serialization) we might address in a future version.

One option in the interim is to write such serialization functions and 
inject them into the `HttpClient` pipeline with [`HttpClient` interceptors](https://angular.io/guide/http#intercepting-requests-and-responses).
