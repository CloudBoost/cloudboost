import React from 'react';
import {Settings} from '../../../app/components/settings/settings.js';

describe('<Settings />', () => {
  let wrapper;
  before(() => {
    const props = {
      appData: {
        appId: util.makeString(),
        masterKey: util.generateRandomString()
      },
      loading: false,
      settingsLoaded: 1,
      onLoad: sinon.spy(),
      resetAppSettings: sinon.spy()
    };
    wrapper = shallow(<Settings {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});