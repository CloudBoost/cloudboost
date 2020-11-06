import React from 'react';
import {Email} from '../../../app/components/settings/email.js';

describe('<Email />', () => {
  let wrapper;
  before(() => {
    const props = {
      appData: {
        appId: util.makeString(),
        masterKey: util.generateRandomString()
      },
      emailSettings: {
        settings: {}
      },
      updateSettings: sinon.spy()
    };
    wrapper = shallow(<Email {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});