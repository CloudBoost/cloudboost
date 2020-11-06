# Introduction

This is the React Component to modify/update the ACL (Access Control List) of a CloudObject or any object having CloudBoost ACL property.

## NPM Installation
```
npm install cloudboost-acl
```

### Usage

``` js

import ACL from 'cloudboost-acl';

//For ES5 (requireJs)
var ACL = require('cloudboost-acl');

```

### Sample Code

``` js

import React from 'react';
import ACL from 'cloudboost-acl'

class YourComponent extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            showACLModal: false
        }
    }

    closeACLModal = () =>  {
        // this is used close the ACL modal
        this.setState({ showACLModal: false })
    }

    saveACL = (updatedObject) => {
        // updatedObject is the object with updated ACL prop
        // you can choose to save this object in any way you like.
    }

    render() {
        return (
          <ACL
              closeACLModal= { this.closeACLModal } // Required // used to close ACL modal
              isOpenACLModal= { this.state.showACLModal }  // Required // true -> Modal is open , false -> Modal is closed
              objectWithACL= { } // Required //  Here you need to pass the object whose ACL prop you want to modify
              onACLSave= { this.saveACL } // Required // this will be called when you click save inside of ACL modal.
              dialogClassName = { } // Optional // Custom class for Modal root/container element
          />
        );
    }

}




```

# LICENSE

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

<img align="right" height="150" src="https://cloud.githubusercontent.com/assets/5427704/7724257/b7f45d6c-ff0d-11e4-8f60-06024eaa1508.png">

#### Getting Started and Tutorials

Visit [Getting Started](https://tutorials.cloudboost.io) for tutorial and quickstart guide.


#### API Reference

Visit [CloudBoost Docs](http://docs.cloudboost.io) for API Reference.

