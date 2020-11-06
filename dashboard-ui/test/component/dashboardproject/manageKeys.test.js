import React from 'react';
import {DeleteApp} from '../../../app/components/dashboardproject/manageKeys.js';

describe('<DeleteApp />', () => {
  let wrapper;
  before(() => {
    const props = {
      onDelete: sinon.spy(),
      deleteButtonState: false,
      show: true,
      close: sinon.spy(),
      handleChange: sinon.spy(),
      loading: {
        modal_loading: false
      },
      appId: util.makeString(),
      id: util.makeString(),
      masterKey: util.generateRandomString(),
      clientKey: util.generateRandomString(),
      planId: 1,
      developers: [],
      invited: sinon.spy(),
      selectedTab: 'onDev'
    };
    wrapper = shallow(<DeleteApp {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});