import React from 'react';
import Dashboardproject from '../../../app/components/dashboardproject/dashboardproject';

describe('<Dashboardproject />', () => {
  let wrapper;
  before(() => {
    wrapper = shallow(<Dashboardproject />, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});