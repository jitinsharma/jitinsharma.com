---
title: Taming Android Resources and LayoutInflater for string manipulation
date: "2020-07-28"
template: "post"
draft: false
slug: "/posts/taming-android-resources-and-layoutinflater-for-string-manipulation/"
category: "Android"
tags:
  - "Android"
description: "Intercepting string resources for dynamic updates."
---

Recently I was working on a problem where we wanted to make our string resources dynamic. In every app, there are strings which would often come from backend APIs and are dynamic by nature, but a lot of strings are packaged in `strings.xml`. There might be requirements to make few of these dynamic as well for eg. A/B testing etc. The major pain point here is these strings would have usages spread all over codebase and there is no default way to override `strings.xml` to make them dynamic.

One solution is to move away from `strings.xml` and keep strings as constant objects or a map. But moving away from `strings.xml` has few disadvantages such as 
- Strings cannot be used in layout preview
- Need new logic for localisation
- Large migration cost of removing string references in existing code base.

So we want to come up with a solution where we can keep `strings.xml` as well as have dynamic updates to them.

In this article I'll try to explain my experiments with string retrieval process to override default string values.

## String packaging and AAPT 🔡
Let's first understand why key-value pairs in `strings.xml` cannot be dynamic by nature.

Here's an example of string resource in `strings.xml`
```xml
<string name="hello_world">Hello World!</string>
```

We can access this string in one of these ways depending on whether we are retrieving it in xml or kotlin file
```xml
android:text="@string/hello_world" //xml
```
```kotlin
context.getString(R.string.hello_world) //kotlin
```

`R.string.hello_world` is a constant integer which is created by `aapt` and added to `R.java` along with other constants. 
Once an `apk` is generated strings are packaged in `resources.arsc` along with other xml data. Here's a image of our packaged string along with it's generated id.

![](media/taming-android-resources-and-layoutinflater-for-string-manipulation/resource-arsc-preview.png)

The id here `0x7f100027` represents the integer value of `R.string.hello_world`.
Any layout file referencing this string value using `@string` is also re-written with same id.

-> `activity_main.xml` packaged in apk
```xml
<TextView
	android:layout_width="-2"
	android:layout_height="-2"
	android:text="@ref/0x7f100027" />
```

Similar replacement also happens in java/kotlin bytecode when they are referenced using `R.string.*` integers.

-> `dex` bytecode for `MainActivity.kt`
```kotlin
.line 22
const v0, 0x7f100027
invoke-virtual {p0, v0}, Lin/jitinsharma/stringplayground/MainActivity;->getString(I)Ljava/lang/String;
move-result-object v0
const-string v1, "getString(R.string.hello_world)"
```

These constant ids are generated in build time and are randomised during each build. Hence it's not possible to update them dynamically.

## Investigating method callstack 🕵️
While it's not viable to update string files themselves, but we could try overriding methods which actually retrieve strings.
In this section we explore the same.

At a lower level, there are always two classes involved when a string is retrieved
- Resources - When `getString` is used java/kotlin
- TypedArray - When `@string/` is used in xml

Let's investigate each of them one by one.

## Resourceful Resources 📚
Let's look at first option of retrieving string via `getString` method. The `getString` methods calls up following chain of methods

```kotlin
── context.getString()
    └── Resources #getString()
        └── AssetManager #getResourceValue()
            └── ApkAssets #getStringFromPool()
                └── StringBlock #get()
```

All classes in this chain are final, except `Resources`. Let's poke it 🕵️‍♂️

We start by subclassing `Resources` to create a `CustomResource` class.
```kotlin
class CustomResources(
    res: Resources,
    private val dynamicStringMap: Map<String, String>
) : Resources(res.assets, res.displayMetrics, res.configuration)
```

The moment you override Resources, you'll be welcomed with following deprecation ⚠️ warning ⚠️
```
@deprecated Resources should not be constructed by apps.
```

Since Resources can be overridden on configuration change, overriding resources is discouraged. Ignoring this warning for now(ofcourse at your risk) 🤷‍♂️

Here we have also have `dynamicStringMap` which is an in-memory map of strings which have been fetched from backend. It's good to keep this structure in memory so the string access is faster since your views might request a lot of strings in their layout cycle. 

Overriding resources allows us to override following methods
```kotlin
override fun getString(id: Int): String {
    return super.getString(id)
}

override fun getStringArray(id: Int): Array<String> {
    return super.getStringArray(id)
}

override fun getText(id: Int): CharSequence {
    return super.getText(id)
}
// More overrides available
```

- `getString` and `getStringArray` are for standard strings and string-arrays which you have declared in `strings.xml`
- `getText` is invoked for any text with custom formatting present within xml.

Each of these methods accept integer as a parameter which is equivalent to what you would pass when calling these methods with `R.string.*`

Now we apply a simple redirection in one of these methods

```kotlin
/**
* For a given id, this function checks if string for that key 
* should be retrieved from dynamic string map.
* If not present, it fallbacks to super call which will retrieve string from strings.xml
**/
override fun getString(id: Int): String {               // id=0x7f100027
    val name = getResourceEntryName(id)                 // name=hello_world
    return dynamicStringMap[name] ?: super.getString(id)// dynamicStringMap[name]=Hello Android!
                                                        // super.getString(id)=Hello World!
}
```
Similar to `getString`, you can set up redirects to `getStringArray`, `getQuantityString`(for `<plurals>`) and many more functions.

Now we have our custom resources, we need to attach them to our context. This can be done by creating a custom ContextWrapper.

```kotlin
class CustomContextWrapper(
    private val base: Context,
    private val dynamicStringMap: Map<String, String>
) : ContextWrapper(base) {

    override fun getResources() = CustomResources(base.resources, dynamicStringMap)
}
```
> **ContextWrapper allow us to override context by providing a new copy of it. The exisiting context remains intact.**

Now we can attach this CustomContextWrapper in our activity
```kotlin
// MainActivity.kt
override fun attachBaseContext(newBase: Context) {
    super.attachBaseContext(CustomContextWrapper(newBase, dynamicStringMap))
}
```

**Note**: ContextWrappers are needed to be attached only at Activity. Fragments, Custom View end up inheriting context from container activity itself.

You can also attach ContextWrapper to base activity if you have one or manually add this to all activities(or write an annotation processor to automate it 🙂 )

Once we complete this setup
- We have a `dynamicStringMap` which contains subset of strings which need to be dynamic.
- All `getString` calls are routed through our custom resources which decides which string value should be returned.
- All implementation details of `getString` in our codebase remain untouched.

The problem is half solved though, we still need to figure out a solution for `@string` in xml resources.

## Finding view in a haystack 🔍
String values in xml layouts are not resolved from `Resources`, hence our existing solution doesn't work for strings referenced in layout files and in most of codebases we are still dependent on xml layouts so it's not something we can ignore.

```xml
android:text="@string/hello_world"
```

Any text referenced in xml via `@string` is resolved by corresponding View using `TypedArray`.
`TypedArray` is final by definition and cannot be subclassed.

> `TypedArray` is an internal android class which is used to retrieve attributes from various xml resources. All Views use `TypedArray` to get attributes such as `text`, `layout_width` etc. TypedArray is also recycled for optimisation and reuse.

`TypedArray` is important and can't be overridden. So now what?

While we can't override text which is reaching `TextView` from `TypedArray`, we can always override the view itself!

All views are inflated using `LayoutInflater` and this class itself can be overridden to create a `CustomLayoutInflater`. Again, I should warn you about creating Custom LayoutInflater may come with it's own set of unintended issues(but that hasn't stopped us till now 😛 ).

```kotlin
class CustomLayoutInflater constructor(
    original: LayoutInflater,
    newContext: Context,
) : LayoutInflater(original, newContext)
```

Overriding `LayoutInflater` needs overriding a lot of functions and classes such as `Factory`, `Factory2`. What we are looking specifically is for a function which creates view.

```kotlin
override fun onCreateView(name: String, attrs: AttributeSet): View? {
    try {
        val view = createView(name, "android.widget.", attrs)
        if (view is TextView) {
            // Here we get original TextView and then return it after overriding text
            return overrideTextView(view, attrs)
        }
    } catch (e: ClassNotFoundException) {
    } catch (inflateException: InflateException) {
    }
    return super.onCreateView(name, attrs)
}
```

- We override `onCreateView` of `LayoutInflater` and intercept views with prefix `android.widget.` which contains `TextView` class.
- With this we intercept all `TextView`(s) which are inflated but before they are actually painted on screen.

Now onto overriding the TextView
```kotlin
private fun overrideTextView(view: TextView, attrs: AttributeSet?): TextView {
    val typedArray = view.context.obtainStyledAttributes(attrs, intArrayOf(android.R.attr.text))
    val stringResource = typedArray.getResourceId(0, -1)
    view.text = view.resources.getText(stringResource)
    typedArray.recycle()
    return view
}
```
Using same old `TypedArray`, we find out the id of string resources at `android:text` location in xml. Once we get the id, we again call `resources.getText` which will route through our `CustomResources` implementation and then set the new string to     `TextView`.

Now that we have our `CustomLayoutInflater` ready, we need to attach it to `CustomContextWrapper` we had created earlier.
```kotlin
class CustomContextWrapper(
    private val base: Context,
    private val dynamicStringMap: Map<String, String>
) : ContextWrapper(base) {

    override fun getResources() = CustomResources(base.resources, dynamicStringMap)

    override fun getSystemService(name: String): Any? {
        if (Context.LAYOUT_INFLATER_SERVICE == name) {
            return CustomLayoutInflater(LayoutInflater.from(baseContext), this)
        }
        return super.getSystemService(name)
    }
}
```

#### Side Note
We can avoid complexities of overriding `LayoutInflater` by using [ViewPump](https://github.com/InflationX/ViewPump) which does the same job and provides an API for intercepting view inflation.

## Resources Loaders 🔮
Android 11 has introduced ability to load resources dynamically via `ResourcesLoader` and `ResourcesProvider`. This is not just restricted to string files but also allows dynamic loading of drawables and other resource files. This is an approximate way of using these classes
```kotlin
val provider = ResourcesProvider.loadFromDirectory("/somepath/", null)
								// or loadFromApk()
val loader = ResourcesLoader()
loader.addProvider(provider)
resources.addLoaders(loader) // Application resources
```
There aren't proper samples of this API provided right now and it's only available on Android 11 and above, so there is a long time for this API to be usable for majority of apps.

### Recap
- We created an in-memory map of strings fetched from server.
- We created `CustomResources` to override string retrieval and redirect it to fetch dynamic strings from map.
- We created `CustomLayoutInflater` to reset text of TextViews inflated from xml with string resource.
- We patched all of this together in `CustomContextWrapper` which is attached to each activity overriding it's context.

### FAQ
- Should i do this?
    
    Depends. There are other alternatives like moving away from xml string resources to normal class objects/variables as strings which won't require above overrides to system classes. But larger codebases may not have that luxury.

- Is anyone else doing this?
    
    There are a lot of open source libraries like [Philogy](https://github.com/JcMinarro/Philology) and even commercial ones like [Crowdin](https://github.com/crowdin/mobile-sdk-android) which use this approach. So there are teams somewhere adopting this approach.

- Is it enough to override `TextView`?

    No. `TextView` might represent bulk of text displayed on your UI but there are classes like `Toolbar` which also display text without a `TextView` component. You can override these classes as well in `CustomLayoutInflater`.

- What are performance impacts?

    I did some performance analysis on my own projects and found results to be kind of inconclusive. Layout inflation time did increase but % varied from 4 to 38 in one case. I guess it's better to trace layout inflation time for your project and check if increase is within limits.

Thanks for reading!
