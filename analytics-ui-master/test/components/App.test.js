import React from 'react';
import {App} from '../../dev/js/components/App.js';

describe('<App />', () => {
  let wrapper;
  before(() => {
    const props = {
      allApps: [],
      appName: util.makeString(),
      appId: util.makeString(),
      userProfilePic: util.makeString(),
      appInitSuccess: true,
      fetchingEvents: true,
      init: true,
      location: util.makeString(),
      children: '',
      initApp: sinon.spy(),
      fetchAllEvents: sinon.spy()
    };

    wrapper = shallow(<App {...props}/>, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});