# Ngrx-data FAQs

<a name="entity"></a>
## What is an _entity_?

An _entity_ is a data object that you read from and write to a database. An _entity_ refers to some persistent "thing" in the application domain, such as a customer. 
Such things are unique even as their values change. Accordingly each entity has a unique identifier.

<a name="ngrx"></a>
## What is _ngrx_?

[Ngrx](https://github.com/ngrx/platform/blob/master/README.md) is a collection of libraries for writing Angular applications in a "reactive style" that combines the
[redux](#redux) pattern and tools with [RxJS Observables](#rxjs). 

The `ngrx-data` library builds upon three _ngrx_ libraries: 
[@ngrx/store](https://github.com/ngrx/platform/blob/master/docs/store/README.md),
[@ngrx/effects](https://github.com/ngrx/platform/blob/master/docs/effects/README.md), and
[@ngrx/entity](https://github.com/ngrx/platform/blob/master/docs/entity/README.md)

<a name="redux"></a>
## What is _redux_?

[Redux](https://redux.js.org/) is an implementation of a pattern for managing application [state](#state) in a web client application.

It is notable for:

* Holding all _shared state_ as objects in a central _store_.

* All objects in the store are [_immutable_](https://en.wikipedia.org/wiki/Immutable_object).
You never directly set any property of any object held in a redux store.

* You update the store by _dispatching events_ to the store.

* An _event_ is like a message. It always has a _type_. It often has a _payload_ which is the data for that message.

* _Events_ sent to the store are processed by _reducers_. A reducer may update the store by replacing old objects in the store with new objects that have the updated state.

* The store raises an event when updated by a reducer.

* You application listens for store events. When you hear a message that matter, you pull the corresponding object(s) from the store.

_Ngrx_ relies on 
[RxJS Observables](#rxjs) to listen for store events, select those that matter, and push the selected object(s) to your application.

<a name="state"></a>
## What is _state_?

_State_ is data. 
Applications have several kinds of state including:

* _application_ state is _session_ data that determine how your application works. Filter values and router configurations are examples of _application_ state.

* _persistent_ state is "permanent" data that you store in a remote database. [Entities](#entity) are a prime example of _persistent_ state. 

* _shared_ state is data that are shared among application components and services.

<a name="rxjs"></a>
## What are _RxJS Observables_"

[RxJS Observables](http://reactivex.io/rxjs/) is a library for programming in a "reactive style".

Many Angular APIs produce _RxJS Observables_ so programming "reactively" with _Observables_ is familiar to many Angular developers. Search the web for many helpful resources on _RxJS_.


<a name="code-generation"></a>
## What's wrong with code generation?

Some folks try to conquer the "too much boilerplate" problem by generating the code.

Adding the `Foo` entity type? Run a code generator to produce  _actions_, _action-creators_, _reducers_, _effects_, _dispatchers_, and _selectors_ for `Foo`.
Run another one to product the service that makes HTTP GET, PUT, POST, and DELETE calls for `Foo`.

Maybe it generates canned tests for them too.

Now you have ten (or more) new files for `Foo`. Multiply that by a 100 entity model and you have 1000 files. Cool!

Except you're responsible for everyone of those files. Overtime you're bound to modify some of them to satisfy some peculiarity of the type.

Then there is a bug fix or a new feature or a new way to generate some of these files. It's your job to upgrade them. Which ones did you change? Why?

Good luck!
