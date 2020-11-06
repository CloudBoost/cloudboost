import React from 'react';
import { ToolBar } from '../../../app/components/toolbar/toolbar.js';

describe('<ToolBar />', () => {
  let wrapper;
  before(() => {
    const props = {
      loading: false,
      currentApp: util.makeString(),
      currentUser: {
        user: {
          isAdmin: true,
          name: util.makeString(),
          email: util.makeEmail()
        },
        file: {
          document: {
            url: util.generateRandomString()
          }
        }
      },
      currentAppName: util.makeString(),
      isAdmin: true,
      apps: [{
        appId: util.makeString()
      }],
      isDashboardMainPage: true,
      beacons: {},
      onLogoutClick: sinon.spy(),
      updateBeacon: sinon.spy()
    };
    wrapper = shallow(<ToolBar {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});