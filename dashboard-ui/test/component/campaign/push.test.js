import React from 'react';
import { PushCampaign } from '../../../app/components/campaign/push.js';

describe('<PushCampaign />', () => {
  let wrapper;
  before(() => {
    const props = {
      appData: {
        viewActive: true,
        appId: util.makeString(),
        masterKey: ''
      }
    };
    wrapper = shallow(<PushCampaign {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});