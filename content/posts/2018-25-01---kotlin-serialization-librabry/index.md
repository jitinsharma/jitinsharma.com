---
title: Kotlin Serialization Library
date: "2018-01-25"
template: "post"
draft: false
slug: "/posts/kotlin-serialization-librabry/"
category: "Kotlin"
tags:
  - "Kotlin"
description: "Kotlin has recently released a library for serialization. To put things in perspective, before this there was no serialization lib provided by kotlin but you could use any platform supported serialization libraries with Kotlin classes(eg. Gson for JVM/Android)."
---

>Ported from **Medium**, original source [here](https://android.jlelse.eu/kotlin-serialization-library-38bf85d8768b)

Kotlin has recently released a library for serialization. To put things in perspective, before this there was no serialization lib provided by kotlin but you could use any platform supported serialization libraries with Kotlin classes(eg. Gson for JVM/Android)

But that’s where Kotlin’s serialization library is different, it’s cross platform and supports multiple formats. The whole lib is built on top of Kotlin’s multiplatform concept.

Currently kotlinx.serialization supports three formats

* JSON
* CBOR
* Protobuf

And platforms are JVM and JS, but others should get added soon as Kotlin/native becomes mature.

Let’s take a look at JSON

Marking `@Serializable` will make a class serializable.

```kotlin
@Serializable
data class Destination(
        var name : String? = "",
        var country : String? = "",
        var code : Int = 0,
)
```

stringify will convert a serializable object to JSON string.

```kotlin
val delhi = Destination(name = "Delhi", country = "India", code = 0)
val delhiAsString = JSON.stringify(delhi)
println(delhiAsString)
// {"name":"Delhi","country":"India","code":0}
```

parse will convert well formed json back to a data class.

```kotlin
val newYork = JSON.parse<Destination>(
        "{\"name\":\"New York\",\"country\":\"USA\",\"code\":3}"
)
println(newYork)
// Destination(name=New York, country=USA, code=3)
```

Parsing has multiple options like

```kotlin
val paris = JSON.unquoted.parse<Destination>(
        "{name:Paris,country:France,code:10}")
println(paris)
// Destination(name=Paris, country=France, code=10)
```

In above example, json string doesn’t have quotes. We can parse such json with `JSON.unquoted`. This can be helpful during debugging.

Here’s a definition of all such properties available

![](https://cdn-images-1.medium.com/max/3492/1*rVs5EHVIHD7OkRImEhkucA.png)

### **Additional Properties**

Often our data objects have properties which could be optional. For example, there could be extra properties which we initialize on client side which server may not provide while fetching the json. Similarly there may be properties which may or may not be present in json. Fortunately the lib handles both cases.

```kotlin
@Optional
var isMetro : Boolean = false,
@Transient
var favorite : Boolean = false
```

Optional — This value will considered during serialization/deserialization. but if not present, it won’t break serialization.

Transient — This value will not be considered during serialization/deserialization. But if present in json, it will cause an exception.

```kotlin
var barcelona = JSON.unquoted.parse<Destination>(
        "{name:Barcelona,country:Spain,code:5}")
println(barcelona)
// Only optional and transient missing, so serialization works
// Destination(name=Paris, country=France, code=10, isMetro=false, favorite=false)

barcelona = JSON.unquoted.parse(
        "{name:Barcelona,country:Spain,code:5,isMetro:true}")
println(barcelona)
// Destination(name=Barcelona, country=Spain, code=5, isMetro=true, favorite=false)
// Optional property isMetro is updated but Transient property favorite remains same

barcelona = JSON.unquoted.parse(
        "{name:Barcelona,code:5,isMetro=true}")
// This will break as "country" is a required field.

barcelona = JSON.unquoted.parse(
        "{name:Barcelona,country:Spaincode:5,
isMetro=true,favorite=true}")
// This will break as "favorite" is not recognised by serializer
```

>  If you’re not sure about consistency of values in json, using JSON.nonstrict might be a good idea to avoid exceptions

### Class variables can have different names than the name of key in json. Just annotate using @SerialName

```kotlin
@SerialName("d_country")
var country : String = ""
```

## Additional Utilities

There are few utilities also available out of box

**Mapper**

Mapper can convert a object to a map — straightforward.

```kotlin
val newYorkAsMap : Map<String,Any> = Mapper.map(newYork) // Mapping
val newNewYork = Mapper.unmap<Destination>(newYorkAsMap) //UnMapping
// Use Mapper.mapNullable() to support null values
```

**ValueTransformer**

Transformer allows custom transformation on each value of object.

```kotlin
object CustomTransformer : ValueTransformer() {

    override fun transformStringValue(desc: KSerialClassDesc, index: Int, value: String): String =
            value.toLowerCase()

    override fun transformIntValue(desc: KSerialClassDesc, index: Int, value: Int): Int =
            when(value) {
                0 -> 1
                else -> super.transformIntValue(desc, index, value)
            }
}

val newDelhi = CustomTransformer.transform(delhi)
println(newDelhi)
// Destination(name=delhi, country=india, code=1)
// Strings are lowercase and integer code 0 became 1
```

There are more override methods for float, boolean etc in ValueTransform.

**Custom Serialization**

The lib allows you to define your own serialization scheme if required.

```kotlin
@Serializable
data class Country(var name : String = "", var hCode : Int = -1) {

    @Serializer(forClass = Country::class)
    companion object : KSerializer<Country>{

        override fun load(input: KInput): Country {
            TODO("Write your own scheme to handle input")
        }

        override fun save(output: KOutput, obj: Country) {
            TODO("Write your own scheme to handle output")
        }

        override val serialClassDesc: KSerialClassDesc
            get() = TODO()
    }
}
```

Full doc here
[**Kotlin/kotlinx.serialization**](https://github.com/Kotlin/kotlinx.serialization)

Code gist: [https://gist.github.com/jitinsharma/8805cf63ba3b371b657531d55d3fd6c5](https://gist.github.com/jitinsharma/8805cf63ba3b371b657531d55d3fd6c5)

Thanks for reading!