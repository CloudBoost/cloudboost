<img src="https://www.dropbox.com/s/gpdhpr3c63dquby/CLoudBoostLogo-Circle-250.png?dl=0&raw=1" height="150" />

[![Build Status](https://travis-ci.org/CloudBoost/cloudboost.svg?branch=master)](https://travis-ci.org/CloudBoost/cloudboost)
[![OpenCollective](https://opencollective.com/cloudboost/backers/badge.svg)](#backers) 

CloudBoost is the complete serverless platform for your app. **Think of CloudBoost as Parse + Firebase + Algolia + Iron.io all combined into one** :
 - Data-Storage / JSON Storage / BLOB Storage
 - 100% data ownership
 - Realtime
 - Search
 - Cache
 - Queues
 - More - ACL's, User Authentication, Server-less apps and more.



## Deploy with Docker (recommended)

You can install CloudBoost anywhere you like. We have a Docker Compose file that can help you get started with CloudBoost in few minutes and with just one command. You can use this compose file to install the service locally on your local dev machine, or you can install the service to Azure, AWS, DigitalOcean, Softlayer, Packet and more.

[Check out our Docker Compose file here.](https://github.com/CloudBoost/docker)

## Running the server without Docker

**Important:** Before you begin you need to install MongoDB 3.4 and Redis 3.0 on your machine to run this project. 

### Step 1 : Git clone the project.

`git clone https://github.com/CloudBoost/cloudboost.git`

### Step 2 : Change directory to CloudBoost.

`cd cloudboost`

### Step 3 : NPM Install.

`npm install`

Note : NPM requires NodeJS to be installed on your machine. If you don't have NodeJS, you need to install it from here : https://nodejs.org/en/download/

### Step 4 : Edit cloudboost.json.

Create a `config` folder in project root if it does not exist.  You need to create a new file `cloudboost.json` under `config` folder and save that file with MongoDB and Redis configuration. Here's a sample file :

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

### Step 5 : Edit smtp.json.

In the `config` folder. Creare a new file called `smtp.json`. You need to create an account at MailGun (https://www.mailgun.com/) and get an API Key. This will help CloudBoost to send emails on your behalf. Here's a quick example :

```
{
  "provider"  : "mailgun",		
  "apiKey"    : "XXXXXXXXXXXXXXXXXXXXXXX",
  "domain"    : "cloudboost.io",
  "fromEmail" : "hello@cloudboost.io",
  "fromName"  : "CloudBoost.io"  
}
```

### Step 6 : Enable HTTPS. (Optional)

If you want to enable HTTPS, place your certificate file `cert.crt` and key `key.key` in the config folder.

### Step 7 : Run the server.

Make sure both Redis and MongoDB are running and then run the CloudBoost server  

`node server.js`

Once the server is running. You'll see the ClusterKey and SecureKey on the console whcih means you've successfully CloudBoost. If you don't see any of these keys, please raise a GitHub issue and let us know.


## Once the server is running, You can

Once started, you'll see the CloudBoost Secure Key on the console. This is important, Please save it for future use.
Secure Key helps you create / delete apps.

### Create an app

To create an app, You need to  :

```
        REQUEST TYPE : POST
        URL : <YOUR_SERVER_URL>/app/<APP ID>
        REQUEST BODY :
        {
            secureKey : YOUR_SECURE_KEY
        }
```

For Example (in curl)  :

```
curl -H "Content-Type: application/json" -X POST -d '{"secureKey":"xxxxxx-yyyy-xxxx-yyyyy-xxx"}' http://localhost:4730/app/app1

```

### Creating a table

Table lets you store any structured data in your app. To create one, [check this documentation out](https://tutorials.cloudboost.io/en/schema/cloudtables).

### Delete an app

To delete an app, You need to  :

```
        REQUEST TYPE : DELETE
        URL : <YOUR_SERVER_URL>/app/<APP ID>
        REQUEST BODY :
        {
            secureKey : YOUR_SECURE_KEY
        }
```

For Example (in curl) :

```
        curl -H "Content-Type: application/json" -X DELETE -d '{"secureKey":"xxxxxx-yyyy-xxxx-yyyyy-xxx"}' http://localhost:4730/app/app1

```

Once your app is ready, You can then get the latest SDK from  https://tutorials.cloudboost.io. Remember to save the SDK in your project. and You can then init your app by :

`CB.CloudApp.init('Your Server URL', 'Your App ID', 'Your App Key');`

You can then follow rest of the documentation from https://tutorials.cloudboost.io. You can also check out API Reference on https://docs.cloudboost.io

## Cluster Maintenance, Scale, and Updates

CloudBoost runs on MongoDB and Redis. You're responsible for managing the [uptime](https://en.wikipedia.org/wiki/Uptime), [replication](https://en.wikipedia.org/wiki/Replication_(computing)), [sharding](https://en.wikipedia.org/wiki/Shard_(database_architecture)), [backups](https://en.wikipedia.org/wiki/Backup) of your data in each of these databases. 

You also need to update CloudBoost with every [new release](https://github.com/cloudboost/cloudboost/releases) and you need to [configure your server to auto-scale it](https://www.brianchristner.io/how-to-scale-a-docker-container-with-docker-compose/). If you're using Docker, the image is released at the `latest` tag and you need to check for new releases atleast once a month. 

[Using our hosted and managed service](https://www.cloudboost.io) helps you to save time, development costs, and eliminates managing your own cluster of servers which is cheaper long-term. We recommend using the hosted service if you're running production apps. 

## App Settings
To read more about app settings, check [Click here](https://github.com/CloudBoost/cloudboost/tree/master/docs/app-settings)

# Support

- Report bugs and feature requests on [GitHub issue tracker](https://github.com/CloudBoost/cloudboost/issues). 
- You can reach out to us on [Slack](https://slack.cloudboost.io). All of our engineers hangout here. 
- [StackOverflow](stackoverflow.com/questions/tagged/cloudboost) : Tag your questions with `cloudboost` tag, so that we're notified.
- Email: [support@cloudboost.io](support@cloudboost.io)
- Twitter: [@cloudboostio](https://twitter.com/cloudboostio)

# Contributing

[Pull requests](https://help.github.com/articles/about-pull-requests/) are very welcome!

We'd love to hear your feedback and suggestions in the [issue tracker](https://github.com/CloudBoost/cloudboost/issues).

# Backers

If you're using CloudBoost Open Source and like what we've built, help us speed development by being a backer. [[Become a backer](https://opencollective.com/cloudboost#backer)]

<a href="https://opencollective.com/cloudboost/backer/0/website" target="_blank"><img src="https://opencollective.com/cloudboost/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/cloudboost/backer/1/website" target="_blank"><img src="https://opencollective.com/cloudboost/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/cloudboost/backer/2/website" target="_blank"><img src="https://opencollective.com/cloudboost/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/cloudboost/backer/3/website" target="_blank"><img src="https://opencollective.com/cloudboost/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/cloudboost/backer/4/website" target="_blank"><img src="https://opencollective.com/cloudboost/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/cloudboost/backer/5/website" target="_blank"><img src="https://opencollective.com/cloudboost/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/cloudboost/backer/6/website" target="_blank"><img src="https://opencollective.com/cloudboost/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/cloudboost/backer/7/website" target="_blank"><img src="https://opencollective.com/cloudboost/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/cloudboost/backer/8/website" target="_blank"><img src="https://opencollective.com/cloudboost/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/cloudboost/backer/9/website" target="_blank"><img src="https://opencollective.com/cloudboost/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/cloudboost/backer/10/website" target="_blank"><img src="https://opencollective.com/cloudboost/backer/10/avatar.svg"></a>


# LICENSE

Copyright 2016 HackerBay Software Private Limited. 

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
