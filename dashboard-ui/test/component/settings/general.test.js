import React from 'react';
import {General} from '../../../app/components/settings/general.js';

describe('<General />', () => {
  let wrapper;
  before(() => {
    const props = {
      appData: {
        appId: util.makeString(),
        masterKey: util.generateRandomString()
      },
      generalSettings: {
        settings: {}
      },
      upsertAppSettingsFile: sinon.spy(),
      updateSettings: sinon.spy()
    };
    wrapper = shallow(<General {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});