
# Adding auth settings to your CloudBoost App

## Properties to set

* general:   
  * callbackURL:(URL-required) This is the URL where users get redirect to after authentication.
  * primaryColor:(Hex Code) Set this to the brand color of your Auth login

* custom:   
  * enabled: (Boolean) Set to true if you want users to signup or login through CloudBoost

* sessions: 
  * sessionLength: (Number) Set the session expiration in days

* signupEmail
  * enabled: (Boolean) Set to true if you want to send signup emails
  * template: (html) This email template will be sent after the user sign up
  * allowOnlyVerifiedLogins: (Boolean) Set to true to prevent user logins if their email is not verified

* resetPasswordEmail
  * enabled: (Boolean) Set to true if you want to send reset password emails
  * template: (html) This email template will be sent after the user requests to reset the password

* facebook
  * enabled: (Boolean) Set to true if you want users to signup or login through facebook
  * appId: (String) Your facebook app Id
  * appSecret: (String) Your facebook app secret
  * attributes: (JSON) Set facebook attributes,check below to see format in section Facebook Social authentication
  * permissions: (JSON) Set facebook permissions, check below to see format in section Facebook Social authentication   

* google
  * enabled: (Boolean) Set to true if you want users to signup or login through facebook
  * appId: (String) Your google client id
  * appSecret: (String) Your google client secret
  * attributes: (JSON) Set google attributes,check below to see format in section Google Social authentication
  * permissions: (JSON) Set google permissions, check below to see format in section Google Social authentication

* twitter
  * enabled: (Boolean) Set to true if you want users to signup or login through twitter
  * appId: (String) Your twitter consumer key
  * appSecret: (String) Your twitter consumer secret 

* linkedIn
  * enabled: (Boolean) Set to true if you want users to signup or login through linkedIn
  * appId: (String) Your linkedin client id
  * appSecret: (String) Your linkedin client secret  
  * permissions: (JSON) Set linkedin permissions, check below to see format in section LinkedIn Social authentication  

* github
  * enabled: (Boolean) Set to true if you want users to signup or login through github
  * appId: (String) Your github client id
  * appSecret: (String) Your github client secret
  * attributes: (JSON) Set github attributes,check below to see format in section Github Social authentication
  * permissions: (JSON) Set github permissions, check below to see format in section Github Social authentication 

Example:
```
{
  general:{   
    callbackURL: "http://todo.com/callback",
    primaryColor: "#549afc"        
  },
  custom:{
    enabled:true
  },
  sessions:{
    sessionLength: 30
  },
  signupEmail:{
    enabled:false,
    allowOnlyVerifiedLogins:false,        
    template:""        
  },
  resetPasswordEmail:{
    enabled:false,       
    template:""        
  },     
  facebook:{
    enabled:true,
    appId:"askjdahskjkjh",
    appSecret:"sdjsdhjdsdsj",       
    attributes:{
              id:true,
              about:false,
              age_range:false,
              bio:false,
              birthday:false
            },
    permissions:{
      public_profile:{
        enabled:true,
        scope:"public_profile"
      },
      user_friends:{
        enabled:false,
        scope:"user_friends"
      },
      email:{
        enabled:false,
        scope:"email"
      }
    }  
  },
  google:{
    enabled:true,
    appId:"askjdahskjkjh",
    appSecret:"jdcgyshduysu",       
    attributes:{          
      'userinfoProfile':{
        enabled: true,
        scope: 'https://www.googleapis.com/auth/userinfo.profile'
      },
      'userinfoEmail':{
        enabled: true,
        scope: 'https://www.googleapis.com/auth/userinfo.email'
      }
    },
    permissions:{
      'contacts':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/contacts'
      },
      'blogger':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/blogger'
      }
    }  
  },
  twitter:{
    enabled:true,
    appId:"sdjgsduy",
    appSecret:"sdcsgdyusdgy"    
  },
  linkedIn:{
    enabled:true,
    appId:"dvjdfhvdfjhu",
    appSecret:"sdsjdbjsdbjsdbh",   
    permissions:{
      r_basicprofile:true,
      r_emailaddress:false,
      rw_company_admin:false,
      w_share:false
    }
  },   
  github:{
    enabled:true,
    appId:"sdvsdsdssdd",
    appSecret:"sdyhuysysysys",       
    attributes:{
      user:{
        enabled: true,
        scope: 'user'
      },
      userEmail:{
        enabled: true,
        scope: 'user:email'
      }         
    },
    permissions:{  
      userFollow:{
        enabled: true,
        scope: 'user:follow'
      },   
      public_repo:{
        enabled: false,
        scope: 'public_repo'
      }
    }  
  }
}
```   
## Facebook Social Authentication
### Attributes 
```
{
  id:true,
  about:false,
  age_range:false,
  bio:false,
  birthday:false,
  context:false,
  cover:false,
  currency:false,
  devices:false,
  education:false,
  email:false,
  favorite_athletes:false,
  favorite_teams:false,
  first_name:false,
  gender:false,
  hometown:false,
  inspirational_people:false,
  install_type:false,
  installed:false,
  interested_in:false,
  is_shared_login:false,
  is_verified:false,
  languages:false,
  last_name:false,
  link:false,
  locale:false,
  location:false,
  meeting_for:false,
  middle_name:false,
  name:false,
  name_format:false,
  payment_pricepoints:false,
  political:false,
  public_key:false,
  quotes:false,
  relationship_status:false,
  religion:false,
  security_settings:false,
  shared_login_upgrade_required_by:false,
  significant_other:false,
  sports:false,
  test_group:false,
  third_party_id:false,
  timezone:false,
  token_for_business:false,
  updated_time:false,
  verified:false,
  video_upload_limits:false,
  viewer_can_send_gift:false,
  website:false,
  work:false
}
```
### Permissions
```
{
      public_profile:{
        enabled:true,
        scope:"public_profile"
      },
      user_friends:{
        enabled:false,
        scope:"user_friends"
      },
      email:{
        enabled:false,
        scope:"email"
      },
      user_about_me:{
        enabled:false,
        scope:"user_about_me"
      },
      "user_actions_books":{
        enabled:false,
        scope:"user_actions.books"
      },
      "user_actions_fitness":{
        enabled:false,
        scope:"user_actions.fitness"
      },
      "user_actions_music":{
        enabled:false,
        scope:"user_actions.music"
      },
      "user_actions_news":{
        enabled:false,
        scope:"user_actions.news"
      },
      "user_actions_video":{
        enabled:false,
        scope:"user_actions.video"
      },     
      user_birthday:{
        enabled:false,
        scope:"user_birthday"
      },
      user_education_history:{
        enabled:false,
        scope:"user_education_history"
      },
      user_events:{
        enabled:false,
        scope:"user_events"
      },
      user_games_activity:{
        enabled:false,
        scope:"user_games_activity"
      },
      user_hometown:{
        enabled:false,
        scope:"user_hometown"
      },
      user_likes:{
        enabled:false,
        scope:"user_likes"
      },
      user_location:{
        enabled:false,
        scope:"user_location"
      },
      user_managed_groups:{
        enabled:false,
        scope:"user_managed_groups"
      },
      user_photos:{
        enabled:false,
        scope:"user_photos"
      },
      user_posts:{
        enabled:false,
        scope:"user_posts"
      },
      user_relationships:{
        enabled:false,
        scope:"user_relationships"
      },
      user_relationship_details:{
        enabled:false,
        scope:"user_relationship_details"
      },
      user_religion_politics:{
        enabled:false,
        scope:"user_religion_politics"
      },
      user_tagged_places:{
        enabled:false,
        scope:"user_tagged_places"
      },
      user_videos:{
        enabled:false,
        scope:"user_videos"
      },
      user_website:{
        enabled:false,
        scope:"user_website"
      },
      user_work_history:{
        enabled:false,
        scope:"user_work_history"
      },
      read_custom_friendlists:{
        enabled:false,
        scope:"read_custom_friendlists"
      },
      read_insights:{
        enabled:false,
        scope:"read_insights"
      },
      read_audience_network_insights:{
        enabled:false,
        scope:"read_audience_network_insights"
      },
      read_page_mailboxes:{
        enabled:false,
        scope:"read_page_mailboxes"
      },
      manage_pages:{
        enabled:false,
        scope:"manage_pages"
      },
      publish_pages:{
        enabled:false,
        scope:"publish_pages"
      },
      publish_actions:{
        enabled:false,
        scope:"publish_actions"
      },
      rsvp_event:{
        enabled:false,
        scope:"rsvp_event"
      },
      pages_show_list:{
        enabled:false,
        scope:"pages_show_list"
      },
      pages_manage_cta:{
        enabled:false,
        scope:"pages_manage_cta"
      },
      pages_manage_instant_articles:{
        enabled:false,
        scope:"pages_manage_instant_articles"
      },
      ads_read:{
        enabled:false,
        scope:"ads_read"
      },
      ads_management:{
        enabled:false,
        scope:"ads_management"
      }
    }
```

## Google Social Authentication
You need to paste your CloudBoost callback URL in "Authorized redirect URIs" field in the Authentication section of the Google API console.
</br>
"&lt;your-server-url&gt;/auth/&lt;your-appId&gt;/google/callback

### Attributes
```
{          
  'userinfoProfile':{
    enabled: true,
    scope: 'https://www.googleapis.com/auth/userinfo.profile'
  },
  'userinfoEmail':{
    enabled: true,
    scope: 'https://www.googleapis.com/auth/userinfo.email'
  }
}
```

### Permissions
```
{
  'contacts':{
    enabled: false,
    scope: 'https://www.googleapis.com/auth/contacts'
  },
  'blogger':{
    enabled: false,
    scope: 'https://www.googleapis.com/auth/blogger'
  },
  'calendar':{
    enabled: false,
    scope: 'https://www.googleapis.com/auth/calendar'
  },
  'gmail':{
    enabled: false,
    scope: 'https://mail.google.com/'
  }, 
  'googlePlus':{
    enabled: false,
    scope: 'https://www.googleapis.com/auth/plus.login'
  },     
  'youtube':{
    enabled: false,
    scope: 'https://www.googleapis.com/auth/youtube'
  },
  'books':{
    enabled: false,
    scope: 'https://www.googleapis.com/auth/books'
  },
  'drive':{
    enabled: false,
    scope: 'https://www.googleapis.com/auth/drive'
  },
  'coordinates':{
    enabled: false,
    scope: 'https://www.googleapis.com/auth/coordinate'
  },     
  'picasa':{
    enabled: false,
    scope: 'https://picasaweb.google.com/data/'
  },
  'spreadsheets':{
    enabled: false,
    scope: 'https://spreadsheets.google.com/feeds/'
  },
  'webmasters':{
    enabled: false,
    scope: 'https://www.googleapis.com/auth/webmasters'
  },
  'tasks':{
    enabled: false,
    scope: 'https://www.googleapis.com/auth/tasks'
  },
  'analytics':{
    enabled: false,
    scope: 'https://www.googleapis.com/auth/analytics'
  },
  'UrlShortener':{
    enabled: false,
    scope: 'https://www.googleapis.com/auth/urlshortener'
  }
}
```

## Twitter Social Authentication
You need to paste your CloudBoost callback URL in "Callback URL" field in the Twitter App Settings.
</br>
"&lt;your-server-url&gt;/auth/&lt;your-appId&gt;/twitter/callback


## LinkedIn Social Authentication
You need to paste your CloudBoost callback URL in "Authorized Redirect URLs" field in the Linkedin Developers App Sections..
</br>
"&lt;your-server-url&gt;/auth/&lt;your-appId&gt;/linkedin/callback

### Permissions
```
{
  r_basicprofile:true,
  r_emailaddress:false,
  rw_company_admin:false,
  w_share:false
}
```

## Github Social Authentication
You need to paste your CloudBoost callback URL in "Authorization callback URL" field in Github Developers App Section.
</br>
"&lt;your-server-url&gt;/auth/&lt;your-appId&gt;/github/callback

### Attributes
```
{
  user:{
    enabled: true,
    scope: 'user'
  },
  userEmail:{
    enabled: true,
    scope: 'user:email'
  }         
}
```

### Permissions
```
{  
  userFollow:{
    enabled: true,
    scope: 'user:follow'
  },   
  public_repo:{
    enabled: false,
    scope: 'public_repo'
  },
  repo:{
    enabled: false,
    scope: 'repo'
  },
  repo_deployment:{
    enabled: false,
    scope: 'repo_deployment'
  },
  repoStatus:{
    enabled: false,
    scope: 'repo:status'
  },
  delete_repo:{
    enabled: false,
    scope: 'delete_repo'
  },
  notifications:{
    enabled: false,
    scope: 'notifications'
  },
  gist:{
    enabled: false,
    scope: 'gist'
  },
  readRepoHook:{
    enabled: false,
    scope: 'read:repo_hook'
  },
  writeRepoHook:{
    enabled: false,
    scope: 'write:repo_hook'
  },
  adminRepoHook:{
    enabled: false,
    scope: 'admin:repo_hook'
  },
  adminOrgHook:{
    enabled: false,
    scope: 'admin:org_hook'
  },
  readOrg:{
    enabled: false,
    scope: 'read:org'
  },
  writeOrg:{
    enabled: false,
    scope: 'write:org'
  },
  adminOrg:{
    enabled: false,
    scope: 'admin:org'
  },
  readPublicKey:{
    enabled: false,
    scope: 'read:public_key'
  },
  writePublicKey:{
    enabled: false,
    scope: 'write:public_key'
  },
  adminPublicKey:{
    enabled: false,
    scope: 'admin:public_key'
  },
  readGpgKey:{
    enabled: false,
    scope: 'read:gpg_key'
  },
  writeGpgKey:{
    enabled: false,
    scope: 'write:gpg_key'
  },
  adminGpgKey:{
    enabled: false,
    scope: 'admin:gpg_key'
  }
}
```

## Make REST request
To save email settings make a PUT REST request to CloudBoost API on with JSON as request body.
</br>
Request: "&lt;your-server-url&gt;/settings/&lt;your-appId&gt;/auth";

Example:
```
var settings={
  general:{   
    callbackURL: "http://todo.com/callback",
    primaryColor: "#549afc"        
  },
  custom:{
    enabled:true
  },
  sessions:{
    sessionLength: 30
  },
  signupEmail:{
    enabled:false,
    allowOnlyVerifiedLogins:false,        
    template:""        
  },
  resetPasswordEmail:{
    enabled:false,       
    template:""        
  },     
  facebook:{
    enabled:true,
    appId:"askjdahskjkjh",
    appSecret:"sdjsdhjdsdsj",       
    attributes:{
              id:true,
              about:false,
              age_range:false,
              bio:false,
              birthday:false
            },
    permissions:{
      public_profile:{
        enabled:true,
        scope:"public_profile"
      },
      user_friends:{
        enabled:false,
        scope:"user_friends"
      },
      email:{
        enabled:false,
        scope:"email"
      }
    }  
  },
  google:{
    enabled:true,
    appId:"askjdahskjkjh",
    appSecret:"jdcgyshduysu",       
    attributes:{          
      'userinfoProfile':{
        enabled: true,
        scope: 'https://www.googleapis.com/auth/userinfo.profile'
      },
      'userinfoEmail':{
        enabled: true,
        scope: 'https://www.googleapis.com/auth/userinfo.email'
      }
    },
    permissions:{
      'contacts':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/contacts'
      },
      'blogger':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/blogger'
      }
    }  
  },
  twitter:{
    enabled:true,
    appId:"sdjgsduy",
    appSecret:"sdcsgdyusdgy"    
  },
  linkedIn:{
    enabled:true,
    appId:"dvjdfhvdfjhu",
    appSecret:"sdsjdbjsdbjsdbh",   
    permissions:{
      r_basicprofile:true,
      r_emailaddress:false,
      rw_company_admin:false,
      w_share:false
    }
  },   
  github:{
    enabled:true,
    appId:"sdvsdsdssdd",
    appSecret:"sdyhuysysysys",       
    attributes:{
      user:{
        enabled: true,
        scope: 'user'
      },
      userEmail:{
        enabled: true,
        scope: 'user:email'
      }         
    },
    permissions:{  
      userFollow:{
        enabled: true,
        scope: 'user:follow'
      },   
      public_repo:{
        enabled: false,
        scope: 'public_repo'
      }
    }  
  }
}

var data = new FormData();        
data.append('key', "your-app-masterKey");
data.append('settings', JSON.stringify(settings));

var xhttp = new XMLHttpRequest();
xhttp.onload  = function() {
if(xhttp.readyState == 4 && xhttp.status == 200) {
  if(xhttp.responseText){
    //Success
  }            
}else if(xhttp.status != 200){
  //Error
}
};
xhttp.open("PUT",<your-server-url>/settings/<your-appId>/email, true);        
xhttp.send(data);
``` 

## Retrieve App Settings
Make a POST REST request to ClouBoost API to retrive your app settings
</br>
Request:&lt;your-server-url&gt;/settings/&lt;your-appId&gt;

Example:
```
var data = new FormData();
data.append('key', "your-masterKey");

var xhttp = new XMLHttpRequest();
xhttp.onload  = function() {
if (xhttp.readyState == 4 && xhttp.status == 200) {
  if(xhttp.responseText){
    //Success
  }            
}else if(xhttp.status!==200){
  //Error
}
};
xhttp.open("POST", <your-server-url>/settings/<your-appId>, true);        
xhttp.send(data);
```

# Contribute
If you want to contribute to this repo. Please make sure you spell check everything and make sure you have tested the code with the live CloudBoost API before sending us the pull request.
