import React from 'react';
import { EmailCampaign } from '../../../app/components/campaign/email.js';

describe('<EmailCampaign />', () => {
  let wrapper;
  before(() => {
    const props = {
      appData: {
        viewActive: true,
        appId: '',
        masterKey: ''
      }
    };
    wrapper = shallow(<EmailCampaign {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});