---
title: Effective guide to Mobile Design Adoption
date: "2023-08-09"
template: "post"
draft: false
slug: "/posts/effective-guide-to-mobile-design-adoption/"
category: "Android"
tags:
  - "Android"
description: "A simple guide to get your design system adopted across organization"
banner: "media/effective-guide-to-mobile-design-adoption/design-system-banner.jpg"
---

<div class="image-container">
    <img src="/media/effective-guide-to-mobile-design-adoption/design-system-banner.jpg"/>
</div>

## Prologue 🍿
Design System is often used by organization to centralize the UI look and feel of their apps across platforms. As a product becomes huge, this becomes a necessity and is also helpful in bringing brand changes easily. I have worked with Design Systems for some time now and one of the biggest issues is not with building it but rather how do you make everyone use it. If you are a large organization with multiple verticals, it becomes a gargantuan task aligning everyone. This guide represents some straightforward steps which you can take to ease this adoption.

## Start with Design Team 👫
A Design system must start with designers itself. If components are not present in the Design tool(Figma, Sketch etc), there is no point of creating them in code. If designers don't have direct access to color tokens when they are creating design, you're bound to fail.
Secondly detaching components shouldn't be allowed when using Design System components. For my code writing fellows, detaching components is equivalent to copy pasting a class instead of using an existing one because you want to change one function inside it.

## Make discovery obvious 🔎
Once a Design System is built, it must be dead simple for everyone(devs, designers, PM) to visualize it. That shiny mail you wrote about launching a Design system, half of your audience didn't even read it and the other half forgot about it over the weekend.

#### ➡ Component Documentation
Every component must be documented at each level - Design and Code. 
- A designer documenting a component must define how it should be used and what obvious mistakes to avoid. Figma links should be previewed inside the doc.
- Code documentations should be written by developers with exhaustive API usages. Use tools like `dokka` to produce HTML pages.

These docs should be combined at a single place -  a website, notion/confluence doc, which then becomes a single source of documentation for your Design System.

#### ➡ Showcase Apps
A centralized doc will allow anyone to look is a good start, but docs don't provide look and feel of components. Everyone should be able to feel the shiny button animation which took 3 days to build, no?

Showcase Apps are simple apps which display rendered components with all their variations for everyone to see. Developers will often be more comfortable by checking out components in per platform apps. These apps can easily be distributed with Firebase Distribution or any other app distribution system you use.

## Making code adoption easy 👨‍💻
If you think making a kick ass Design System with awesome discovery will cause everyone to adopt it, think again lol. Developers while writing UI code will often forget a Design System exists and the copy paste muscle memory is so strong that they'll continue to copy paste UI code across app rather than visit your awesome documentation.

#### ➡ Automated Checks
I actually empathize with developers, in between of wrestling android lifecycle issues and API responses throwing errors with 200 code, who has time to think about Design System. That's why as UI platform engineer, it's your job to make this easier for fellow engineers.

The answer is Lint.

No not Android Lint, well at least not in principle. Linting is a process where you can provide immediate feedback to developers while writing code. 
If a developer writes `TextView` which has a mapped component in the Design System, you show a tiny warning that please use `DSTextView` and so on. Such warnings can go on for color tokens and any number of framework or custom components.

[Android's Lint system](https://googlesamples.github.io/android-custom-lint-rules/index.html) allows you to write such custom rules quite easily for any language(XML, Kotlin, Java) but has performance issues with large projects. You can roll out your own Lint by using IntelliJ's API around PSI. Furthermore you can use Lint checks as blocker on pull requests using tools like [Danger](https://danger.systems/ruby/).

Fun Fact: Android's Lint allows you to write quick fixes as well, so you can rewrite entire component code according to Design System specifications with one click. This can be invoked via command line as well which can help with automated migration.

#### ➡ API design
API of components must be future proof - your system will evolve, if brittle changes break APIs you are discouraging others to use it. Components should be built with composition in mind, where every layer could be broken down into blocks.

For your own sanity, keep everything private and only expose outer layers. Remember it's always easier to make private code public later if reusability use-case occurs but making a public code private will send you down a migration spiral from which you may never recover.

Lower level components like Text, Button etc should try to mimic framework component APIs to help with muscle memory of engineers. But sometimes framework components itself have batshit APIs, so in such cases use your better senses for API design.

## Build Metrics 📊
Once you have done everything to help with discovery and code adoption, it is time for visualization. Everyone loves numbers and graphs and at some point of time you will have to convince VPs to adopt Design System in products and they will ask for numbers.

#### ➡ The who doesn't use metric
The first number you should build is which project/module/product is using how much of the Design System. You need the results of Lint static analysis here. You can use the Lint system to list down who's using what, are they using `TextView` or `DSTextView`, are they using hardcoded colors or color tokens etc. From this build a website, which shows % of adoption of Design System in each project/module/product and showcase it to everyone.
If you have rapport with product teams, you can even set OKRs using this number (ex. 80% design system coverage in Q2).

PS: If you are currently stuck at Design System adoption, do this step at priority and see your numbers fly by next quarter.

#### ➡ The who uses metric
This is a show off metric to feel good about yourself. It is the reverse of what we did earlier, using the same data from Lint static analysis, we figure out how many times a project/module/product used our component. This gives a count of component usages, multiplied by a calculated number of hours (effort a product dev would take to build this component himself) and you get the number of hours the team saved because they used the Design System component. Profit💰!

## Epilogue 🎬
If you have reached here, I hope this guide helps you out with Design Systems. As a platform engineer, it's always beneficial to view fellow developers as customers and align with their viewpoint, that's when you bring out the best solutions for the platform. If you have any questions, feel free to reach me on ~~[Twitter](https://twitter.com/_jitinsharma)~~, well on [X](https://twitter.com/_jitinsharma).

