**Reply to Mike Ryan critique: DO NOT PUBLISH**

I am most grateful for your thoughtful feedback on `ngrx-data`.
I know that took time from a busy schedule.

I was able to turn your suggestions and critique into
some actionable effort. 
And of course I have feedback on your feedback.

## Cringeworthy redux fanboyism

This bothers me too as you know. I took pains everywhere in the docs to avoid saying anything about whether ngrx/redux is a good thing or a bad thing. 
I say “_if you’ve decided that ngrx is for you, this library may help.” I do a little description of what I take to be the distinctive characteristics of ngrx/redux and that’s that. If you remember any place where I did more than that, please let me know.

I think you’re remarks on this subject are so _on point_ that I’d like to devote a page of the docs to them!  **That includes your critical remarks!**  I think that criticism is very important for people to read and mull over. I’d really like them to hear it. I’d really like them to know your misgivings and know that it came from you. 

Can I craft a “Mike Ryan’s Thoughts On Ngrx and Nrgx-data” page, starting with this content? It would be your page to change as you wish. I think it’s _that important_ to have your perspective as _an intrinsic part of the product_ rather than force people to find critical remarks elsewhere (which I expect to have anyway).  *It would be very clear that you are not endorsing* ngrx-data. I’m not trying to promote ngrx-data. It’s an _experiment_ in tackling a perceived problem … emphasis on _experiment_.

Regardless, I am grateful to have your thoughts.

## Response to your discomfort

Having said that, I am not sure I understand or fully appreciate parts of the critique. Let’s start with this one:

>In order to write an NgRx app that describes data flow the actions dispatched as the result of user interaction have to be very specifically named, capture a real event, and most importantly be _unique_. I can’t read a reducer with generic action type like `ADD_ALL [Invoice]` and immediately know where this action is being dispatched from. In apps that actually need Redux, this is a deal breaker.

(1) I’m not sure that when I write an app that relies on NgRx that “describing the data flow” is upper most in my mind. Maybe you think it should be. But I have the feeling that an application developer is focused first on getting and saving entities to accomplish an app task. Somehow they became convinced that ngrx was the right vehicle for that. It certainly beats rolling their own data management layer!  But for many the mechanics are something they’d encapsulate … most especially from the component.

(2) I don't understand your objection to `ADD_ALL [Invoice]`

The ngrx-data action type names _are unique_.
Each entity's action flows through the ngrx apparatus in its own path.

Maybe I wasn't clear about that.
You can see that it is so by looking at a running app in the redux tools.

Is it the generated _type name_ that bothers you? 
That's easy to change by replacing the `EntityActionFactory.formatActionType()`. 
It's trivial to produce `INVOICE_ADD_ALL` instead.

The ngrx-data library doesn't care because it doesn't make decisions based on the `Action.type`.
The ngrx-data library redirects Actions to Effects and Reducers based on the `Action.op` and `Action.entityName` properties. 

It's easy to take a particular entity type out of the ngrx data flow.
Create your own actions that lack these two properties and ngrx-data will ignore them.
Now you're outside ngrx-data and free to give them their own reducers, effects, etc. 

(3) The following statement is a mystery to me

>I can't read a reducer with generic action type like `ADD_ALL [Invoice]` and immediately know where this action is being dispatched from.

A reducer _never_ tells you who dispatched the action. Not with ngrx-data. Not with ngrx. Not with redux. You only know that the action arrived.

One of the false claims of redux is that you can understand what is going on by tracing the actions. Sure you can see what happens from the moment that the action arrives at the store through to the update of the store. But you have _no clue_ who dispatched the action or why. You have no idea who is affected by the store updates.

The same is true of Breeze, btw. Breeze is a _single source of truth_ for entities. Because breeze entities track their own change-state, a dev knows when the app even attempts to change an entity property or add or remove entities from cache. She can know when the app attempts any persistence action. But who did it or why? No clue. Who is looking at an entity property? No idea.

The best you can do in ngrx/redux is search your application code for dispatchers to see if they dispatch an action of interest. Even then, you can't know statically know when or why. Nor are dispatches deterministic. The user can do things that trigger actions in any order. The server might respond differently. The app doesn't become deterministic because reducers are deterministic.

(4) Are you objecting to generic reducers?

You read the reducer source to learn what it will do with an action - generic or not.
A generic-type reducer has the benefit of telling you that an action it processes will be handled the same way for all the entity types that it sees.

That's an enormous relief when 80% of the entity types _should_ handle the "ADD_ALL" operation the same way. You won't wonder if entity X is accidentally handling it differently than entity Y.

OTOH, you can't tell which entity types will be handled by the generic reducer.
If I see `fooReducer`, it's going to handle `Foo` entities (and, I hope, not `Bar` entities).

Is that the objection?
If so, I'll take that uncertainty rather than risk the more likely possibility that the `fooReducer` and the `barReducer` differ when adding entities to cache because the developer neglected to update both reducers when fixing and "add all" bug.

It's also easy to see which reducers are exceptional
because they're registered in the `EntityReducerFactory.entityCollectionReducers`.

>This is new since you looked.
I had intended to make it easy to create custom reducers and I have in `1.0.0-alpha.3`.

Of course I'm assuming that if I really do need different treatment for `Foo` than the other entity types, that I _can write a `fooReducer`_, I _can register `fooReducer`_ with ngrx-data, and ngrx-data will route `ADD_ALL [Foo]` to the `fooReducer` rather than the generic entity reducer.

This ability _is a feature of ngrx-data_. I just have to document it properly.

>It was clumsy to do before.
Quite easy as if `1.0.0-alpha.3` with custom reducer registration,
the ability to replace the default `EntityCollectionReducer`,
or even replace the entire reducer-creating-and-calling mechanism.

(5) Entity-specific actions with generic effects

You wondered whether it would be possible to
"_write actions with a high degree of specificity while still being able to generically trigger a side effect._"

Yes you can. You don't have to call an `EntityService`. The `EntityService` is a convenience and fits the way I think about this. But I knew that others (like you) would want to dispatch actions directly and perhaps to their own reducers outside of the `ngrx-data` reducers.

(6) On GraphQL

>You make a query against the cache and if it doesn't have the data it reaches across the wire and fetches it from the server. 

This turns out to be a terrible idea in practice.
We used to do this a decade ago. Worked great in 2-tier apps with line-of-sight to the database.
Not so great in 3-tier when the client is far away. We got constant complaints about bad performance because developers abused the capability and unwittingly made hundreds or thousands of little requests where they should have designed for one or fewer or at least did some rate limiting.

But if you really wanted to do that, there's a `loaded` flag on the collection that reports if the collection has been fully loaded (`QUERY_ALL`).
One should be able to leverage that in a selector combo.

I do like the opportunity to provide an observable API. I'm thinking about how we could do that for Breeze, which has plenty of events that could become observables.

Immutability is a much bigger decision. I didn't know that GraphQL had immutability. Maybe that's an option.

Another apparent problem with GraphQL is that it requires a GraphQL intermediary on the server to interface with backing stores that are not GraphQL-ready. None of our clients are GraphQL-ready and they're not likely to be. 

I also don't think GraphQL is designed for transactional systems with relational data models, again something our clients require. 

(7) I remember that you were resistant to ThoughRam’s _facade_ and thought that resistance might carry over to the ngrx-data `EntityService`. You didn't seem to mind here.

But, anticipating that resistance, I made sure that the dev could adopt ngrx-data without buying into the `EntityService`. You can get the dispatcher and selector services if you like them (just as you can use the @ngrx/data `EntityAdapter` or not).

You can can dispatch directly to the store if you want.

(8) I'm intrigued that you think ngrx-data offers a good API for the _container/presentational component_ architecture.

I personal find that architecture overwrought. It's borrowed straight from react world which, lacking dependency injection, makes sharing information and services across components especially painful. The _container/presentational component_ architecture makes that more manageable in react. It's really unnecessary in Angular and leads to a chutes-and-ladders component trees, passing stuff up and down with `@Input` and `@Output`. Most developers will have difficulty understanding how the components fit together. I know that I do. OK, so we disagree on whether that is a good idea and we can have a lively discussion on that another time. 

What interests me here is that you use the _container_ component the same way that I use the _facade service_: they both insulate data access from presentation, they confine knowledge of data access to something that has no presentational responsibilities, and they give the work of user interaction to components that don’t really know how data are acquired or saved.  So we’re actually on the same page here. 

(9) On custom reducers.

I took to heart you urgent suggestion that we make it easy to replace and/or recompose the entity collection reducers.

That was going to be an early next step.
I accelerated it and I think I have a flexible approach in
`1.0.0-alpha.3` which includes an analog of the _store MetaReducers_ that
targets `EntityCollectionReducers` specifically.

## Thanks again for your thoughtful response!
