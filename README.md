<img src="https://www.dropbox.com/s/7ghf1kl7crp5bvy/CbLogoIcon.png?raw=1" height="80" />

[![Build Status](https://travis-ci.org/CloudBoost/cloudboost.svg?branch=master)](https://travis-ci.org/CloudBoost/cloudboost)

CloudBoost is the Complete NoSQL Database Service for your app. **Think of CloudBoost as Parse + Firebase + Algolia + Iron.io all combined into one** :
 - Data-Storage / JSON Storage / BLOB Storage
 - 100% data ownership
 - Realtime 
 - Search
 - Cache
 - Queues
 - More - ACL's, User Authentication, Server-less apps and more. 
 
###Deploy CloudBoost to Heroku
 
Use this button to connect your Heroku app with CloudBoost. 

[![Heroku](https://www.herokucdn.com/deploy/button.svg)](https://elements.heroku.com/addons/cloudboost)

###Deploy CloudBoost with Docker Cloud
 
Use this button to deploy CloudBoost to any cloud with Docker Cloud.

[![Deploy to Docker Cloud](https://files.cloud.docker.com/images/deploy-to-dockercloud.svg)](https://github.com/CloudBoost/docker)

###Deploy CloudBoost to Azure
 
Use this button to deploy CloudBoost to Azure with Docker Cloud.

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://github.com/CloudBoost/docker)

###Deploy CloudBoost to AWS
 
[Install CloudBoost on AWS](https://github.com/CloudBoost/docker)

###Deploy CloudBoost to DigitalOcean
 
Use this button to deploy CloudBoost to Digital Ocean with Docker Cloud.

[![Install on DigitalOcean](http://installer.71m.us/button.svg)](https://github.com/CloudBoost/docker)

###Deploy CloudBoost to SoftLayer
 
[Install CloudBoost on SoftLayer](https://github.com/CloudBoost/docker)

###Deploy CloudBoost to Packet
 
[Install CloudBoost on Packet](https://github.com/CloudBoost/docker)


#CloudBoost Indexing Backends

CloudBoost runs on MongoDB and Redis. You're responsible for managing the uptime, backups of your data in each of these databases. If you're running production apps. We recommend you to use the hosted service instead. Please check out CloudBoost.io 

#Running the server with Docker (Recommended) 

The easiest way to run the server is by using Docker. Check https://github.com/cloudboost/docker

#Running the server without Docker

###Step 1 : Git clone the project. 

`git clone https://github.com/CloudBoost/cloudboost.git`

###Step 2 : Change directory to CloudBoost. 

`cd cloudboost`

###Step 3 : NPM Install. 

`npm install`

Note : NPM requires NodeJS to be installed on your machine. If you don't have NodeJS, you need to install it from here : https://nodejs.org/en/download/

###Step 4 : Edit cloudboost.json. 

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

###Step 6 : Edit smtp.json. 

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

###Step 6 : Enable HTTPS. (Optional) 

If you want to enable HTTPS, place your certificate file `cert.crt` and key `key.key` in the config folder. 

###Step 7 : Run the server. 

Make sure both Redis and MongoDB are running and then run the CloudBoost server  

`node server.js`

Once the server is running. You'll see the ClusterKey and SecureKey on the console whcih means you've successfully CloudBoost. If you don't see any of these keys, please raise a GitHub issue and let us know. 


#Once the server is running, You can 

Once started, you'll see the CloudBoost Secure Key on the console. This is important, Please save it for future use.
Secure Key helps you create / delete apps. 

###Create an app

To create an app, You need to  : 

```
        REQUEST TYPE : POST
        URL : <YOUR_SERVER_URL>/app/<APP ID>
        REQUEST BODY :
        {
            secureKey : YOUR_SECURE_KEY
        }
```

for example : 

```
        REQUEST TYPE : POST
        URL : http://localhost:4730/app/app1
        REQUEST BODY :
        {
            secureKey : xxxxxxxxxxxxxxxxxxxxxxxx
        }
```

###Delete an app

To delete an app, You need to  : 

```
        REQUEST TYPE : DELETE
        URL : <YOUR_SERVER_URL>/app/<APP ID>
        REQUEST BODY :
        {
            secureKey : YOUR_SECURE_KEY
        }
```

for example : 

```
        REQUEST TYPE : DELETE
        URL : http://localhost:4730/app/app1
        REQUEST BODY :
        {
            secureKey : xxxxxxxxxxxxxxxxxxxxxxxx
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


