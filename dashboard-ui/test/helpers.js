import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount, render, shallow } from 'enzyme';
import { jsdom } from 'jsdom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import * as CB from 'cloudboost';

require.extensions['.css'] = () => {
  return;
};

var exposedProperties = ['window', 'navigator', 'document'];

global.expect = expect;
global.sinon = sinon;

global.mount = mount;
global.render = render;
global.shallow = shallow;

global.util = {
  makeString: function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },
  makeEmail: function() {
    return this.makeString() + '@sample.com';
  },
  generateRandomString: function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
};

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

// global.navigator = { userAgent: 'all' };
global.__isDevelopment = true
global.__isHosted = process.env["CLOUDBOOST_HOSTED"] || false
global.__isBrowser = false;
if(__isHosted){
	global.USER_SERVICE_URL = "https://service.cloudboost.io"
	global.SERVER_DOMAIN = "cloudboost.io"
	global.SERVER_URL='https://api.cloudboost.io'
	global.DASHBOARD_URL='https://dashboard.cloudboost.io'
  global.ACCOUNTS_URL='https://accounts.cloudboost.io'
  global.SLACK_TOKEN_URL = "https://slack.com/api/oauth.access"
} else {
	global.USER_SERVICE_URL = "http://localhost:3000"
	global.SERVER_DOMAIN = "localhost:4730"
	global.SERVER_URL="http://localhost:4730"
	global.DASHBOARD_URL="http://localhost:1440"
  global.ACCOUNTS_URL="http://localhost:1447"
}

const muiTheme = getMuiTheme();
global.themeContext = {
  context: { muiTheme },
  childContextTypes: { muiTheme: React.PropTypes.object }
}

global.CB = CB;
CB.CloudApp.init(SERVER_URL, util.makeString, util.generateRandomString);