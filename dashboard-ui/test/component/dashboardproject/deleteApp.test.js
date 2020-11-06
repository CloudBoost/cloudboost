import React from 'react';
import { DeleteApp } from '../../../app/components/dashboardproject/deleteApp.js';

describe('<DeleteApp />', () => {
  let wrapper;
  before(() => {
    const props = {
      onDelete: sinon.spy(),
      deleteButtonState: false,
      showDeleteModal: true,
      closeDeleteModal: sinon.spy(),
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