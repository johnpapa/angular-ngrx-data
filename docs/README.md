# Angular _ngrx-data_ Overview

## Zero Boilerplate Ngrx

***You may never write an action, reducer, selector, effect, or HTTP dataservice again.***

[_Ngrx_](faq.md#ngrx) helps Angular applications manage shared state in a "reactive" style, following the [redux](faq.md#redux) pattern.

Everyone complains about the amount of boilerplate code you must write and maintain to manage [entity](faq.md#entity) data with ngrx.

In standard ngrx, every entity type has a multitude of actions, reducer cases, and selectors that look virtually the same across all entity types.

Several libraries offer to _reduce_ the boilerplate. Some will _generate_ it for you.
Ngrx-Data _eliminates it altogether_.

_Ngrx-data_ stores entities by type in distinct collections in an entity cache within the ngrx state tree. To fetch and modify entity data, it dynamically generates the corresponding ngrx actions, reducers, selectors and effects as you need them.

## It's still _ngrx_

This is a _library for ngrx_, not an ngrx alternative.

Every entity has its own actions. Every operation takes its unique journey through the store, reducers, effects, and selectors. You just let _ngrx-data_ create these for you.

You can still add more store properties, actions, reducers, selectors, and effects. You can override any ngrx-data behavior for an individual entity type or for all entities.

See the [README.md](../readme.md) for instructions on installing the library and running the demo app.

Learn about _ngrx-data_.

* Read the demo app source code in `src/client`.
* Read and run the tests (`ng test`).
* Review the library source code in the `lib` folder.
* Read the guides in the `docs` folder.

## _Ngrx-Data_ guides

This page and other guide pages are markdown pages in the repository `docs` folder.

* [Introduction](introduction.md) 
* [Entity Metadata](entity-metadata.md)
* [Entity Collection](entity-collection.md)
* [Entity Service](entity-service.md)
* [Entity DataService](entity-dataservice.md)
* [Entity Actions](entity-actions.md)
* [Entity Reducer](entity-reducer.md)
* [Entity Change Tracker](entity-change-tracker.md)
* [Extension Points](extension-points.md)
* [Limitations](limitations.md)
* [FAQ: Frequently Asked Questions](faq.md)
