import React from 'react';
import { DeleteApp } from '../../../app/components/dashboardproject/addDeveloper.js';

describe('<DeleteApp />', () => {
  let wrapper;
  before(() => {
    const props = {
      onDelete: sinon.spy(),
      deleteButtonState: false,
      show: true,
      close: sinon.spy(),
      loading: false,
      id: util.makeString(),
      appId: util.makeString(),
      masterKey: util.makeString(),
      clientKey: util.makeString(),
      planId: 1,
      developers: {},
      invited: true,
      selectedTab: 'addDev'
    };
    wrapper = shallow(<DeleteApp {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});