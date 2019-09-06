---
title: Network Profiler in Android Studio 3.1
date: "2018-03-29"
template: "post"
draft: false
slug: "/posts/network-profiler-android-studio/"
category: "Android Studio"
tags:
  - "Android Studio"
  - "Android"
description: "Android Studio 3.1 recently came out of beta. It has a lot of features such as kotlin lint checks, D8 compiler and also a revamped Network Profiler."
---

Android Studio 3.1 recently came out of beta. It has a lot of features such as kotlin lint checks, D8 compiler and also a revamped **Network Profiler**.

From early days of DDMS, we could always check how network data was being consumed but the current iteration of profiler has added a whole new set of features. Let’s check them out

First of all, network graph looks pretty neat

![](https://cdn-images-1.medium.com/max/3332/1*MoKlMWet4KS8TXvHKE7jww.png)

### Request Debugging

Clicking on any request in graph will give you it’s details such as Request type and Response data.

![](https://cdn-images-1.medium.com/max/2220/1*1a470GtDWs6bLEXiMDvbdQ.png)

You can also check Request and Response headers

![Request headers](https://cdn-images-1.medium.com/max/2000/1*yFFAIJYNDn1qSrHTQA8DNw.png)

![Response headers](https://cdn-images-1.medium.com/max/2144/1*mmaN_wczgEwG95M96wUE2g.png)

If it’s a POST request, you can see body of request as well

![POST Request](https://cdn-images-1.medium.com/max/2104/1*d1bDXSRB1ZhnhRSpy3dVxQ.png)

I have found this to be very **useful**. In past I have used tools such as [Charles](https://www.charlesproxy.com/) to intercept and find request/response related details especially when dealing with third party APIs. This allows us to completely avoid that and check such details directly from Android Studio!

Bonus Point — If you are using third party SDKs, you can always check any arbitrary request going from your app and get details such as server url etc. Below is an example request sent from Crashlytics caught by the profiler

![](https://cdn-images-1.medium.com/max/4836/1*-LRfcrGWNsulHPNnw_EIdA.png)

Always better know such things in advance, than [getting red faced later.](https://medium.com/tow-center/the-graph-api-key-points-in-the-facebook-and-cambridge-analytica-debacle-b69fe692d747)

### And one last thing

Profiler can also help you catch radio bursts of high power when you’re on mobile network.

![Radio’s mode shown in blue line](https://cdn-images-1.medium.com/max/5588/1*sfeXZeKxYAOz_tTF6qSfjw.png)

The graph presents a timeline of when your application causes the radio to remain in high power mode which in turn causes more battery consumption. You can use this to investigate network calls and make your application more battery friendly.

To understand more about Radio state machine, read [here](https://developer.android.com/training/efficient-downloads/efficient-network-access.html#RadioStateMachine)

That’s all. Thanks for reading!