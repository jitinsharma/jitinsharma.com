---
title: Targeting Kotlin for both Android and iOS
date: "2018-03-21"
template: "post"
draft: false
slug: "/posts/targeting-kotlin-for-android-ios/"
category: "Kotlin"
tags:
  - "Kotlin"
  - "iOS"
  - "Multiplatform"
description: "Kotlin has been traditionally used as a language for JVM based platforms and has become highly popular in Android ecosystem. As the language matures, it is knocking on new frontiers — platforms other than JVM, one of them being iOS."
---

>Ported from **Medium**, original source [here](https://proandroiddev.com/targeting-kotlin-for-both-android-and-ios-dec5b967006a)

Kotlin has been traditionally used as a language for JVM based platforms and has become highly popular in Android ecosystem. As the language matures, it is knocking on new frontiers — platforms other than JVM, one of them being iOS.

Kotlin started out with compilation to .class files which allowed interoperability with Java and conversion to .dex for Android. But now with [Kotlin Native](https://github.com/JetBrains/kotlin-native), kotlin can target platforms which directly execute bytecode without a VM — emebedded systems, macOS and **iOS.**

Let’s look at an example
```kotlin
const val API_KEY = "abdfkdfgl453"
class Helper {
    fun getSum(first: Int, second: Int): Int = first + second
    fun sliceFilterAndSort(list: List<String>): List<String> = 
            list.subList(0, 4).filter { it.length > 3 }.sortedBy { it.length }

    companion object {
        val helperId: Int = 0
        fun getHelperType() : String = "Helper234"
    }
}

data class Model(
        var id: Int = 0,
        var type: String = ""
)
```

Above is a simple piece of code with multiple classes and variables written in kotlin. Important thing to note is that it is not importing any library except for *kotlin-stdlib*

And here is a build.gradle for compiling this code into a jar

```groovy
group 'io.github.jitinsharma'
version '1.0-SNAPSHOT'

buildscript {
    ext.kotlin_version = '1.2.21'

    repositories {
        mavenCentral()
    }
    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

apply plugin: 'java'
apply plugin: 'kotlin'

sourceCompatibility = 1.8

repositories {
    mavenCentral()
}

dependencies {
    compile "org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version"
}

compileKotlin {
    kotlinOptions.jvmTarget = "1.8"
}
compileTestKotlin {
    kotlinOptions.jvmTarget = "1.8"
}
```

Now we’ll compile this to a .jar using *./gradlew assemble* and then import this to an Android Project.

![Classes Generated](https://cdn-images-1.medium.com/max/2000/1*GGGoF41MuTlrN4zoj_zUaQ.png)

We can see three class files generated from Base.kt

* BaseKt.class — For constant API_KEY variable

* Helper and Model both of which are seperate classes

Now we can simple call this code in an Activity in a very straightforward way


 ```kotlin
 class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val helper = Helper()
        val sum = helper.getSum(2,3)
        sumView.text = "Sum: " + sum

        val modifiedList = helper.sliceFilterAndSort(
                listOf("Adam","Aakash","John","Enrique","Abhishek"))
        println(modifiedList)

        val helperId = Helper.helperId
        val helperType = Helper.getHelperType()
        println("$helperId $helperType")

        val model = Model()
        println(model)
        val model2 = model.copy(id = 3)
        println(model2)

        val key = API_KEY
        println(key)
    }
}
```

## Moving to iOS

Let’s see if we can reproduce similar approach for iOS using Kotlin Native plugin.

In a folder above our Base project, we’ll add following build.gradle

```groovy
buildscript {
    ext.kotlin_native_version = '0.6'
    repositories {
        mavenCentral()
        maven {
            url "https://dl.bintray.com/jetbrains/kotlin-native-dependencies"
        }
    }
    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-native-gradle-plugin:$kotlin_native_version"
    }
}
group 'io.github.jitinsharma'
apply plugin: "konan"
konan.targets = ["iphone", "iphone_sim"]
konanArtifacts {
    framework('Base') {
        srcDir 'base/src/main/kotlin'
    }
}
```

Few things to note

* **konan** is the plugin for Kotlin Native which allows targeting kotlin code to multiple platforms

* konan.targets specify for which targets bytecode must be generated. We can also add other platform like *raspberry pi* to it.

* konanArtifacts will specify artifacts to be generated along with their name and src directory if required.

We will run *./gradlew build* on this which will produce the following

![Objective C framework created after build](https://cdn-images-1.medium.com/max/3944/1*nn6AHDhQU7Zvz9FBI4k4sg.png)

We now have a file named **Base.framework** which is an **iOS framework** file and can be directly imported to Xcode. Let’s do that!

![Link framework file to a project](https://cdn-images-1.medium.com/max/2000/1*yqpst-IZIxBYesSVAm57IA.png)

We have received something called **Base.h **from the framework which contains code converted from **Base.kt** .

Header files are a little complex to read but Xcode provides Swift conversion of such files for better understanding. Here is an excerpt of what is present in header file

 ```swift
 import Foundation

open class KotlinBase : NSObject {
    open class func initialize()
}

extension KotlinBase : NSCopying {
}

open class BaseHelper : KotlinBase {
    public init()
    open func getSum(first: Int32, second: Int32) -> Int32
    open func sliceFilterAndSort(list: [String]) -> [String]
}

open class BaseHelperCompanion : KotlinBase {
    public convenience init()
    open func getHelperType() -> String
    open var helperId: Int32 { get }
}

open class BaseModel : KotlinBase {
    public init(id: Int32, type: String)
    open func component1() -> Int32
    open func component2() -> String
    open func doCopy(id: Int32, type: String) -> BaseModel
    open var id: Int32
    open var type: String
}

open class Base : KotlinBase {
    open class func API_KEY() -> String
}
```

* By default a class named **KotlinBase **is created which extends NSObject and also implements NSCopying and all other classes extend this class.

* All classes have prefix “Base” which is the name we provided in build.gradle while creating the iOS framework

* **Int** from Kotlin is converted to **Int32** in Swift not *Int(Swift).*

* Kotlin’s List<T> is converted to a Swift Array.

* Companion object is converted to a separate class with an init() method.

* Module level constant API_KEY is converted to an function within a class.

* **BaseModel **which is derived from a data class has a function *doCopy *similar to copy() of data class. But default initialization or copy is not possible as all arguments must be specified while initializing or copying.

Now let’s try to call these functions from a Swift file

 ```swift
 class ViewController: UIViewController {
    @IBOutlet weak var sumView: UITextField!
    override func viewDidLoad() {
        super.viewDidLoad()
        let base = BaseHelper()
        
        sumView.text = "Sum: \(base.getSum(first: 2, second: 3))"
        let value = base.sliceFilterAndSort(list: ["Adam","Aakash","John","Enrique","Abhishek"])
        value.forEach { (value) in
            NSLog(value)
        }
        
        let model = BaseModel(id: 2, type: "model1")
        let model2 = model.doCopy(id: 3, type: model.type)
        NSLog("\(model2)")
        
        let key = Base.API_KEY()
        let helperId = BaseHelperCompanion.init().helperId
        NSLog(key)
        NSLog("\(helperId)")
    }
}
```

![](https://cdn-images-1.medium.com/max/2000/1*MdYOXbj0Mpias_biYP2xDw.gif)

So we took a piece of raw Kotlin code and ran it on multiple platforms without actually changing anything on the platform side code. Although above code may not be useful for production level applications, but in future as Kotlin Native and Kotlin Mutliplatform gets mature, we should be able to move more logic towards a common project.

[Kotlinx Serialization](https://github.com/Kotlin/kotlinx.serialization) is a library built on this concept and supports JVM/JS for now with native support coming soon. With this we should be able to serialize/deserialize data classes to JSON on all platforms with single lib.

Full code here: 
[**https://github.com/jitinsharma/kotlin_multi_target**](https://github.com/jitinsharma/kotlin_multi_target)

Thanks for reading!
