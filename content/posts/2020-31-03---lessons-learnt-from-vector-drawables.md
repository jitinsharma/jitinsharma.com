---
title: Lessons learnt from Vector Drawables
date: "2020-03-31"
template: "post"
draft: false
slug: "/posts/lessons-learnt-from-vector-drawables/"
category: "Android"
tags:
  - "Vectors"
  - "Android"
description: "Working safely with Vector Drawables on different API levels."
---

![](media/lessons-learnt-from-vector-drawables/vector-header.png)

Dialing back to days of Android 5.0 release(s) one of the things which got a lot of people excited was Android got support for SVGs in form of vector Drawables. No longer you were required to draw custom shapes or have icon png(s) based on density, just import SVGs using Android Studio and let the support library draw them for you!

This article is more or less a list of lessons which I've learnt while working with vectors and how to make sure to use vectors safely avoiding crashes on devices with API level less than 21.

## Without Support Library
By default, if you don't enable support library use all vector drawables are converted to pngs in their density folders. While this means you'll never face an rendering issue since pngs are supported in all versions of Android, this will definitely increased size of your app by a lot if you heavily depend on vectors.

Here's how a vector xml file in transformed into multiple pngs during build cycle

![](media/lessons-learnt-from-vector-drawables/vector-png.png)

This rasterization into pngs modifies after build size of one vector(in this case) from 2kb to 7kb which is more than **3x** size increase. 

Ideally this approach should be avoided if your app has a lot of vectors. Let's look into next section on how to work with Support Library.
## With Support Library
To use vectors with support library, there is a simple flag which can be added in `build.gradle`
```groovy
android {
    ...
    vectorDrawables.useSupportLibrary = true
}
```

and add following code to your Application class's `onCreate`
```kotlin
AppCompatDelegate.setCompatVectorFromResourcesEnabled(true)
```
Using support library means there is no conversion of xml to pngs based on density, instead these drawables are drawn on runtime on canvas.

Following this we will broadly divide usage into following sections

  - [Using vector drawables in Framework Components](#using-vector-drawables-in-framework-components)
  - [Loading drawables outside xml](#loading-drawables-outside-xml)
  - [Working with custom views](#working-with-custom-views)
  - [Safeguarding with lint](#safeguarding-with-lint)
  - [TL;DR](#tl-dr)

### Using vector drawables in Framework Components
A very straightforward way of using vectors is `ImageView` which can be used for icons/shapes etc.

Since vectors are not supported natively, they always should be used with `app` namespace. Android Studio does a good job to let you know the same for `ImageView`

![](media/lessons-learnt-from-vector-drawables/vector-imageview.png)

But let's look at some other scenarios

#### TextView
We can also set icon to `TextView` as `drawableStart`, `drawableTop` etc.

```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:drawableStart="@drawable/ic_account"
    android:text="Account" />
```
If you run this code on devices with **API <21**, you'll face this error. 
```shell
Caused by: android.view.InflateException: Binary XML file line #11: Error inflating class TextView
...
Caused by: android.content.res.Resources$NotFoundException: File res/drawable/ic_account.xml from drawable resource ID #0x7f060060
```

For `TextView`, the solution is already present if you are using `androidx.appcompat` version `1.1.0` or above.

```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Account"
    app:drawableStartCompat="@drawable/ic_account" />
```

#### Other Views/ViewGroups
Unfortunately, Android Studio doesn't warn if vectors are used with `android` namespace in components other than `ImageView` which makes it harder to find out where vector rendering might become a problem. There are a lot of practical use cases where you could use vectors outside of `ImageView` such as background of a smaller `ViewGroup` and also you can use them to draw complex shapes without writing `canvas` related code yourself.

In such cases, a there are two ways to use vectors with `android` namespace

1. Wrap them in a `StateList` drawable

`ic_account_statelist.xml`
```xml
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@drawable/ic_account" />
</selector>
```
By creating `StateList`, this drawable can used with `android` namespace anywhere and should work below API 21, though this requires you to create on extra file per vector.

2. Load vectors as drawables and set them outside of xml in Kotlin/Java

You can set drawables to `TextView`, `ViewGroup` etc outside of xml also
```kotlin
viewGroup.background = yourDrawable
textView.setCompoundDrawables(leftDrawable, topDrawable, rightDrawable, bottomDrawable)
```

Now the question is how to load Drawable. 

### Loading drawables outside xml
The most common known way of loading drawable is via `ContextCompat`
```kotlin
ContextCompat.getDrawable(this, R.drawable.ic_account)
```

Also there is another less known way
```kotlin
AppCompatResources.getDrawable(this, R.drawable.ic_account)
```

In current scenario both will work fine since this is plain vector.
But let's say we have a vector which has a `gradient` tag
```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:width="9dp"
    android:height="17dp"
    android:viewportWidth="9"
    android:viewportHeight="17">
    <path
        android:pathData="M7.1921,17L8.0072,17L8.0072,0L0,0L0,9.8079C-0,11.8049 0.2818,12.9046 0.8109,13.894C1.3401,14.8834 2.1166,15.6599 3.106,16.1891C4.0954,16.7182 5.1951,17 7.1921,17Z"
        android:strokeWidth="1"
        android:fillType="evenOdd"
        android:strokeColor="#00000000">
        <aapt:attr name="android:fillColor">
            <gradient
                android:startY="17"
                android:startX="3.3198788"
                android:endY="17"
                android:endX="5.201214"
                android:type="linear">
                <item android:offset="0" android:color="#000000"/>
                <item android:offset="1" android:color="#FFFFFF"/>
            </gradient>
        </aapt:attr>
    </path>
</vector>
```

Loading this vector via `ContextCompat` will throw this error on devices with **API level 21-23**

```shell
Caused by: org.xmlpull.v1.XmlPullParserException: Binary XML file line #13: invalid color state list tag gradient
```

This works fine above **API 23** and even below **API 21** but fails in between these APIs. Weird, right!

Let's look at what `ContextCompat` does

![](media/lessons-learnt-from-vector-drawables/contextcompat-getdrawable.png)

Above **API 21**, it uses `context` to inflate drawables, but there is a catch. Support for `gradient` tag in vectors was introduced in **API 24** hence resolving drawables via `context` will fail below **API 24** since framework doesn't know what `gradient` tag is!

Below **API 21**, it uses `context.getResources` and IIRC, inflation of drawables via `Resources` is intercepted by `AppCompat` and it takes over inflation of drawables.

This error can be avoided by using `AppCompatResources` instead of `ContextCompat` which works well on all API levels because it does a lot of checks! 😅 Look for yourself

![](media/lessons-learnt-from-vector-drawables/appcompatresources-getdrawable.png)

Preferring `AppCompatResources` becomes fairly important if you have a utility class or an extension function to load drawables app wide, since that class won't be aware of what kind of drawables it's receiveing.

### Working with custom views
If your app has Custom Views in it, it might be possible that you are receveing drawable references through custom attributes. These attributes can then resolve drawables via `TypedArray`

```kotlin
class TrafficView(context: Context, attrs: AttributeSet?) : View(context, attrs) {

    init {
        val typedArray = context.theme.obtainStyledAttributes(attrs, R.styleable.TrafficView,0, 0)
        val drawable = typedArray.getDrawable(R.styleable.TrafficView_image_src)
        addDrawable(drawable)
        typedArray.recycle()
    }
}
```
`typedArray.getDrawable` will fail below **API 21** if drawable has a vector tag in it. This is also one of the reasons `android` namespace in framework components cannot resolve vectors since `TypedArray` is bound to framework API level and cannot be overriden by `AppCompat`.

For custom views this can be solved by creating an extension function
```kotlin
fun TypedArray.getDrawableCompat(context: Context, @StyleableRes id: Int): Drawable? {
    val resource = getResourceId(id, 0)
    if (resource != 0) {
        return AppCompatResouces.getDrawable(context, resource)
    }
    return null
}
```

Here instead of inflating `Drawable` via `TypedArray`, we just retrieve resourceId from it and then use `AppCompatResources` to safely inflate the drawable.

### Safeguarding with Lint
Android Studio's lint checks may not be enough if you're using vectors heavily in your app and often use it outside of `ImageView`. In such cases it might be beneficial to write your own lint rule to prevent runtime issues.

Here are two examples which will cause crash at runtime where we are using vector with `android` namespace on API levels below 21.

![](media/lessons-learnt-from-vector-drawables/linear-layout-vector.png)

![](media/lessons-learnt-from-vector-drawables/textview-vector.png)

We can write a custom lint rule which will then give out errors in XML whenever vectors are used without `app` namespace.

<details>
<summary><u><code class="language-kotlin">VectorUsageDetector</code></u></summary>
<p>

```kotlin
class VectorUsageDetector : ResourceXmlDetector() {

    companion object {

        val VECTOR_ISSUE = Issue.create(
                id = "Vector Usage Issue",
                briefDescription = "Warns usage of vectors with `android` namespace",
                explanation = "Vectors with `android` are not supported in API level below 21",
                category = Category.CORRECTNESS,
                severity = Severity.ERROR,
                implementation = Implementation(
                        VectorUsageDetector::class.java,
                        Scope.RESOURCE_FILE_SCOPE
                )
        )
    }

    override fun appliesTo(folderType: ResourceFolderType): Boolean {
        return folderType == ResourceFolderType.LAYOUT
    }

    override fun getApplicableAttributes(): Collection<String>? {
        return XmlScannerConstants.ALL
    }

    override fun visitAttribute(context: XmlContext, attribute: Attr) {
        val name = attribute.name
        val value = attribute.value
        if (name.contains("android:") and value.contains("drawable")) {
            val isVectorDrawable = isVectorDrawable(value.replace("@drawable/", ""), context)
            if (isVectorDrawable) {
                context.report(
                        VECTOR_ISSUE,
                        attribute,
                        context.getValueLocation(attribute),
                        "Vector is used without `app` namespace. This can cause a crash on API levels below 21.")
            } else {
                return
            }
        } else {
            return
        }
    }

    private fun isVectorDrawable(name: String, context: XmlContext): Boolean {
        var isVectorDrawable = false
        context.mainProject.resourceFolders.forEach { folder ->
            val path = folder.path
            val drawableFolder = "$path/drawable/"
            val drawableFile = File("$drawableFolder/$name.xml")
            if (drawableFile.exists()) {
                drawableFile.forEachLine { lineString ->
                    if (lineString.contains(TAG_VECTOR)) isVectorDrawable = true
                }
            }
        }
        return isVectorDrawable
    }
}
```

</p>
</details>  

Here's how it looks like with lint rule in place.

![](media/lessons-learnt-from-vector-drawables/linear-layout-lint-error.png)

![](media/lessons-learnt-from-vector-drawables/textview-lint-error.png)

Having instrumentation test case which run on devices with API level less than 21 can also help to catch these errors early.


### TL; DR

- Vectors are great for icons and small custom shapes, but use them judiciously with support library
- Always use `AppCompatResouces` over `ContextCompat` when loading vector drawables.
- Always prefer `app` namespace when using vector drawables in xml.
- Write Lint rules to safeguard incorrect usage and run instrumentation test cases on device with API level less than 21.

#### Extra material on Vectors
- Here's a 25 min video on Vectors - [Vector Assets](https://youtu.be/fgbl34me3kk)
- Here's a library which extends certain svg functionalities to Vector Drawables - [kyrie](https://github.com/alexjlockwood/kyrie)

Thanks for reading!

Stay safe.
