import React from 'react';
import Notifications from '../../../app/components/feedback/feedback.js';

describe('<Notifications />', () => {
  let wrapper;
  before(() => {
    const props = {
      beacons: {
        dashboardFeedback: ''
      },
      user: {
        user: {
          name: util.makeString(),
          email: util.makeEmail()
        }
      },
      updateBeacon: sinon.spy()
    }
    wrapper = shallow(<Notifications {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});