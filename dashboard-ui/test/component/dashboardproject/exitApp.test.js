import React from 'react';
import { DeleteApp } from '../../../app/components/dashboardproject/exitApp.js';

describe('<DeleteApp />', () => {
  let wrapper;
  before(() => {
    const props = {
      onDeleteDev: sinon.spy(),
      deleteButtonState: false,
      show: true,
      close: sinon.spy(),
      handleChange: sinon.spy(),
      loading: {
        modal_loading: false
      },
      appId: util.makeString(),
    };
    wrapper = shallow(<DeleteApp {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});