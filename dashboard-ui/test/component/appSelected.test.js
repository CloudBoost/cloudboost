import React from 'react';
import { AppSelected } from '../../app/components/appSelected.js';

describe('<AppSelected />', () => {
  let wrapper;
  before(() => {
    let appId = util.makeString()
    const props = {
      loading: false,
      children: '',
      isAppActive: true,
      apps: [{
        appId: appId
      }],
      params: {
        appId: appId
      },
      manageApp: sinon.spy()
    }
    wrapper = shallow(<AppSelected {...props}/>, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});