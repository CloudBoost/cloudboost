#CloudBoost 

[![Build Status](https://travis-ci.org/CloudBoost/cloudboost.svg?branch=master)](https://travis-ci.org/CloudBoost/cloudboost)

CloudBoost is the Complete NoSQL Database Service for your app. **Think of CloudBoost as Parse + Firebase + Algolia + Iron.io all combined into one** :
 - Data-Storage / JSON Storage / BLOB Storage
 - 100% data ownership
 - Realtime 
 - Search
 - Cache
 - Queues
 - More - ACL's, User Authentication, Server-less apps and more. 


#CloudBoost Indexing Backends

CloudBoost runs on MongoDB and Redis. You're responsible for managing the uptime, backups of your data in each of these databases. If you're running production apps. We recommend you to use the hosted service instead. Please check out CloudBoost.io 

#Running the server with Docker (Recommended) 

The easiest way to run the server is by using Docker. Check https://github.com/cloudboost/docker

#Running the server without Docker

If you're runnning the server without Docker. You need to create a new file `cloudboost.json` under `config` folder and save that file with MongoDB, Redis and ElasticSearch configuration. Here's a sample file : 

```
{
 "mongo" : [{
   "host" : "localhost",
   "port" : "27017"
 }], 
 "redis" : [{
       "host" : "127.0.0.1",
       "port" : 6379       
   }]
}
```

#Once the server is running, You can 

Once started, you'll see the CloudBoost Secure Key on the console. This is important, Please save it for future use.
Secure Key helps you create / delete apps. 

To create an app, You need to  : 

```
        POST <YOUR_SERVER_URL>/app/<APP ID>
        BODY {
            secureKey : YOUR_SECURE_KEY
        }
```

To delete an app, You need to  : 

```
        DELETE <YOUR_SERVER_URL>/app/<APP ID>
        BODY {
            secureKey : YOUR_SECURE_KEY
        }
```

Once your app is ready, You can then get the latest SDK from  https://tutorials.cloudboost.io. Remember to save the SDK in your project. and You can then init your app by :

`CB.CloudApp.init('Your Server URL', 'Your App ID', 'Your App Key');`

You can then follow rest of the documentation from https://tutorials.cloudboost.io. You can also check out API Reference on https://docs.cloudboost.io

#App Settings
To read more about app settings, check [Click here](https://github.com/CloudBoost/cloudboost/tree/master/docs/app-settings) 

#Contributing

Pull requests are very welcome!

We'd love to hear your feedback and suggestions in the issue tracker.


#LICENSE

Copyright 2016 HackerBay, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
