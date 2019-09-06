---
title: A Multiplatform approach to MVI
date: "2019-08-19T22:40:32.169Z"
template: "post"
draft: true
slug: "/posts/a-multiplatform-approach-to-mvi/"
category: "Kotlin"
tags:
  - "Multiplatform"
  - "Kotlin"
description: "As mobile applications have become massive pieces of code, we have always looked over architectures as a sole source of maintenance and making code easier for us. We have moved through cycles of architectures such as MVC, MVP, MVVM - MV* is a more appropriate acronym."
---

As mobile applications have become massive pieces of code, we have always looked over architectures as a sole source of maintenance and making code easier for us. We have moved through cycles of architectures such as MVC, MVP, MVVM - MV* is a more appropriate acronym.


But as our applications become more intuitive and faster, a requirement for reactive paradigm has always been felt. This is fulfilled in web through concepts of flux/redux and in mobile through MVI(same concept different target). And boy is it popular!
<br>

![alt-text](/media/mvi-multiplatform-1.png)
<br>

MVI has pretty straightforward concepts

- Single source of truth
- State driven UI
- Side effects
- State produced through pure functions

![alt-text](/media/mvi-multiplatform-2.png)

As is with other architectures, MVI also produces a lot of boilerplate code. You may need a core library to implement the base framework and then states, reducers, store have to be also implemented.


This also means 2x work if you have Android + iOS using the same

### Enter Kotlin Multiplatform!

```kotlin
val counterStore = Store(
    reducer = ::counterReducer,
    state = CounterState()
)
```