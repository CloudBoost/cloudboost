import React from 'react';
import {Push} from '../../../app/components/settings/push.js';

describe('<Push />', () => {
  let wrapper;
  before(() => {
    const props = {
      pushSettings: {
        settings: {
          android:{
            credentials:[]
          },
          windows:{
            credentials:[]
          },
          apple:{
            certificates:[]
          }
        }
      },
      upsertAppSettingsFile: sinon.spy(),
      appData: {
        appId: util.makeString(),
        masterKey: util.generateRandomString()
      },
      updateSettings: sinon.spy()
    };
    wrapper = shallow(<Push {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});