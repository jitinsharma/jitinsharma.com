---
title: Playing with Kotlin Higher Order Functions
date: "2017-12-07"
template: "post"
draft: false
slug: "/posts/playing-kotlin-higher-order-functions/"
category: "Kotlin"
tags:
  - "Kotlin"
description: "One of the cool things in Kotlin is having ability to pass around functions as objects. That’s where higher order functions come and allow us to write code more declaratively."
---

One of the cool things in Kotlin is having ability to pass around functions as objects. That’s where higher order functions come and allow us to write code more declaratively.

I’m gonna list down some function blocks

Let’s start with basic ones

We often run into scenarios where we encapsulate logic inside try/catch block but just log the exception in catch block. Sometimes even the catch seems useless, *so…*

```kotlin
inline fun <T> justTry(block: () -> T) = try { block() } catch (e: Throwable) {}
```
\
And now we just forget the catch block

```kotlin
justTry {
    myFunctionWhichMayFail()
}
```
\
Similarly

```kotlin
inline fun debugMode(block : () -> Unit) {
    if (BuildConfig.DEBUG) {
        block()
    }
}

inline fun lollipopAndAbove(block : () -> Unit) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        block()
    }
}

inline fun Context.withNetwork(block: () -> Unit) {
    val connectivityManager = this.getSystemService(Context.CONNECTIVITY_SERVICE) as?  ConnectivityManager
    connectivityManager?.let {
        val netInfo = it.activeNetworkInfo
        netInfo?.let {
            if (netInfo.isConnected) {
                block()
            }
        }
    }
}
```

transforms to

```kotlin
debugMode {
    StrictMode.setThreadPolicy(StrictMode.ThreadPolicy.Builder()
            .detectAll()
            .penaltyLog()
            .build())
}

lollipopAndAbove {
    view.elevation = 1.0f
}

withNetwork {
    // make network request
}
```

Again, this makes code more readable and looks nice :)


>  But one should consider the logic which should be transformed into function block. The above code block only has if condition which works fine but if there needs to be an else section, we may wanna avoid function blocks. This is valid for withConnection {} where an else case may be required to show some message for network connectivity.

Moving on to more cool stuff

```kotlin
fun <T> asyncRxExecutor(heavyFunction: () -> T, response : (response : T?) -> Unit) {
val observable = Single.create<T>({e ->
    e.onSuccess(heavyFunction())
})
observable.subscribeOn(Schedulers.newThread())
        .observeOn(AndroidSchedulers.mainThread())
        .subscribe { t: T? ->
            response(t)
        }
}
```

The above code is a generic function which accepts a function as a first parameter, executes using RxJava observable in a new thread and then sends back response exposed as a lambda. Here is a sample usage

```kotlin
asyncRxExecutor({ myHeavyFunction() }, { response ->
    println(response.toString())
})
```

So basically we took an arbitrary function which was already written or may be written in future , did it’s execution asynchronously and returned a result.

![](https://cdn-images-1.medium.com/max/2000/1*A2gir0uUVzdlgiEkPUoyvQ.png)

We could use different mechanism for async execution like Kotlin Coroutines

```kotlin
fun <T> asyncCoroutinesExecutor(heavyFunction: () -> T, response : (response : T?) -> Unit) {
    async(UI) {
        val data : Deferred<T> = bg {
            heavyFunction()
        }
        response(data.await())
    }
}

asyncCoroutinesExecutor({ myHeavyFunction() }, { response ->
    println(response.toString())
})
```

We can similarly create an executor for running code on ui thread.

```kotlin
inline fun uiThreadExecutor(crossinline block: () -> Unit) {
    val mainHandler = Handler(Looper.getMainLooper())
    mainHandler.post{
        block()
    }
}
```

and…

```kotlin
thread {
    myHeavyFunction()
    uiThreadExecutor {
        view.text = "Just updating"
    }
    myAnotherHeavyFunction()
}
```
>  thread {} is provided by Kotlin itself for running code in a thread.

This is just the tip of the iceberg of what we can do with higher order functions!
I’m maintaining a repo where I add utilities like this. Have a look

[**jitinsharma/Kotlin.someExtensions**](https://github.com/jitinsharma/Kotlin.someExtensions)