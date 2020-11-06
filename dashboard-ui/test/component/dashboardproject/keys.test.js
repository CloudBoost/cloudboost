import React from 'react';
import {Keys} from '../../../app/components/dashboardproject/keys.js';

describe('<Keys />', () => {
  let wrapper;
  before(() => {
    const props = {
      appId: util.makeString(),
      masterKey: util.generateRandomString(),
      clientKey: util.generateRandomString(),
      onGenMasterKey: sinon.spy(),
      onGenClientKey: sinon.spy()
    };
    wrapper = shallow(<Keys {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});