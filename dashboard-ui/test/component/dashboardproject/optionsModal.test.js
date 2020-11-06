import React from 'react';
import OptionsModal from '../../../app/components/dashboardproject/optionsModal.js';

describe('<OptionsModal />', () => {
  let wrapper;
  before(() => {
    const props = {
      id: util.makeString(),
      appId: util.makeString(),
      invited: true,
      developers: {},
      clientKey: util.makeString(),
      masterKey: util.makeString()
    };
    wrapper = shallow(<OptionsModal {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});