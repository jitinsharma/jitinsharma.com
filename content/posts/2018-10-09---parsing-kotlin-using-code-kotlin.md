---
title: Parsing Kotlin code using Kotlin
date: "2019-09-10"
template: "post"
draft: false
slug: "/posts/parsing-kotlin-using-code-kotlin/"
category: "Kotlin"
tags:
  - "Kotlin"
  - "PSI"
description: "
As Android codebases have moved largely to kotlin, code analysis for kotlin code presents itself as a unique problem with a utterly simple solution."
---

<img src="/media/parsing-kotlin-using-code-kotlin/logo.svg" width="75" height="75"/>

So you are already writing code in Kotlin and it feels great. The feeling is mutual, Kotlin is a great language and everyone loves lambdas.

I'm writing about here a problem which I faced earlier where I was trying to do code analysis over Kotlin files to create a tool. The problem statement was to read the whole code and figure problems inside it.

But first things first, **why would you want to parse files?**

- Create custom documentation, I know there is *dokka* but it never worked properly for me
- Do code analysis over .kt files
- Anything else? Once you get handle to source code, it opens a lot of possibilites - you'll see, read on

## How
The answer is right there, literally, inside the kotlin compiler!

```groovy
implementation "org.jetbrains.kotlin:kotlin-compiler-embeddable:1.3.21"
```

The embeddable jar has classes inside it which allow us to parse kotlin source code.

We're gonna use Intellij's PSI formats to parse our files.

>**What is this PSI format you talk about sire?**

Well I'm glad you asked. PSI(Program Structure Interface) is Intellij internal format used for representating files inside Intellij IDEA. More details [here](https://www.jetbrains.org/intellij/sdk/docs/basics/architectural_overview/psi.html)

That's right we're gonna parse our code in similar fashion to how Intellij does it.(ok maybe a bit substandard fashion)

## Show me code

First thing we need to setup a project by creating environment for Kotlin

```kotlin
private val project by lazy {
    KotlinCoreEnvironment.createForProduction(
            Disposer.newDisposable(),
            CompilerConfiguration(),
            EnvironmentConfigFiles.JVM_CONFIG_FILES //Can be JS/NATIVE_CONFIG_FILES for non JVM projects
    ).project
}
```

Remember Envrionments can be created for any language like Java because PSI is language independent, it can used to parse Java code also

Once we have a **project** we would like to convert Kotlin source as a string to a **KtFile**

```kotlin
fun createKtFile(codeString: String, fileName: String) =
        PsiManager.getInstance(project)
            .findFile(
                LightVirtualFile(fileName, KotlinFileType.INSTANCE, codeString)
            ) as KtFile
```

**KtFile** is base representation of Kotlin Source File. It's not a class representation, since Kotlin doesn't necesarily need files to have classes in them. **KtFile** can have classes, functions etc as it's children.

A simple example would finding all *imports* in the file
```kotlin
ktFile.importList?.imports // Returns List<KtImportDirective>
```

Similarly we can get classes and function declarations
```kotlin
ktFile?.children.forEach { psiElement -> 
    when(psiElement) {
        is KtClass -> { // Class }
        is KtNamedFunction -> { // Function }
    }
}
```

Go inside a function? Sure why not!
```kotlin
ktNamedFunction.children.forEach { child ->
    if (child is KtBlockExpression) {
        // Statements inside function
    }
}
```

Above snippets of code can be really useful if you want to analyze your own source code and build tools around it(such as code analysis)

## Practical Example

I have an [open source repository](https://github.com/jitinsharma/Kotlin.someExtensions) where I keep on adding extension functions related to Android. It's a set of files and not a complete project. So to generate **.md** files for the code, I had to build up something of my own instead of using dokka.

The elements in PSI also allow us to access code comments. Here's how
```kotlin
val docText = ktFunction.docComment.text
```

Using this we can generate **.md** files for our code.

Code file: **ImageExtensions.kt**
```kotlin
/**
 * Convert byte array to bitmap
 */
fun ByteArray.convertBytesToBitmap(): Bitmap =
        BitmapFactory.decodeByteArray(this, 0, size)

/**
 * Convert bitmap to a byte array
 */
fun Bitmap.convertBitmapToBytes(): ByteArray {
    val stream = ByteArrayOutputStream()
    this.compress(Bitmap.CompressFormat.PNG, 0, stream)
    return stream.toByteArray()
```
<br>

Generated doc: **ImageExtensions.md**

![ImageExtensions.md](/media/parsing-kotlin-files-kotlin/image-extensions-doc.png)

## Final Words

So we have observed how we can leverage parsing kotlin source code to create solutions around code analysis and auto documentation generation. Let me know in comments if any other use case comes to your mind.

Here's the repository for above example where markdown is auto generated
[https://github.com/jitinsharma/Kotlin.someExtensions](https://github.com/jitinsharma/Kotlin.someExtensions)