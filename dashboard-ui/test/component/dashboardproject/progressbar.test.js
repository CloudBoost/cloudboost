import React from 'react';
import { Progressbar } from '../../../app/components/dashboardproject/progressbar.js';

describe('<Progressbar />', () => {
  let wrapper;
  before(() => {
    const props = {
      onProjectClick: sinon.spy(),
      apiUsed: 50,
      maxAPI: 100,
      storageUsed: 30,
      maxStorage: 100,
      appId: util.makeString()
    };
    wrapper = shallow(<Progressbar {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});