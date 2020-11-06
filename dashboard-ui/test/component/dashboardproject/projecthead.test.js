import React from 'react';
import { Projecthead } from '../../../app/components/dashboardproject/projecthead';

describe('<Projecthead />', () => {
  let wrapper;
  before(() => {
    const props = {
      loading: false,
      beacons: {
        firstApp: true
      },
      dispatch: sinon.spy(),
      apps: []
    };
    wrapper = shallow(<Projecthead {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});